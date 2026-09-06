from __future__ import annotations

import re
from pathlib import Path

import pandas as pd
import streamlit as st

from db import (
    add_consultation,
    add_knowledge,
    initialize,
    load_consultations,
    load_exam_attempts,
    load_knowledge,
    save_exam,
    set_review_status,
)


ROOT = Path(__file__).resolve().parent
WORKBOOK = ROOT / "outputs" / "家电售后知识库项目" / "AI赋能家电售后知识库与客服培训体系.xlsx"

st.set_page_config(page_title="家电售后智训台", page_icon="🏠", layout="wide")

st.markdown(
    """
    <style>
    :root { --navy:#20364A; --teal:#2D7F7A; --pale:#EAF4F2; --gold:#D8A547; }
    .stApp { background: #F6F8FA; }
    [data-testid="stSidebar"] { background: #20364A; }
    [data-testid="stSidebar"] * { color: white; }
    .hero { padding: 1.25rem 1.5rem; border-radius: 18px; color: white;
            background: linear-gradient(120deg,#20364A,#2D7F7A); margin-bottom: 1rem; }
    .hero h1 { margin:0; font-size:2rem; }
    .hero p { margin:.35rem 0 0; opacity:.9; }
    .answer { padding:1.1rem 1.25rem; background:white; border-left:5px solid #2D7F7A;
              border-radius:10px; box-shadow:0 5px 18px rgba(32,54,74,.08); }
    .risk-high { color:#B42318; font-weight:700; }
    .risk-mid { color:#9A6700; font-weight:700; }
    div[data-testid="stMetric"] { background:white; padding:12px 16px; border-radius:12px;
                                  border:1px solid #E2E8F0; }
    .small-note { color:#64748B; font-size:.88rem; }
    </style>
    """,
    unsafe_allow_html=True,
)


@st.cache_data(show_spinner=False)
def load_data(path: Path) -> dict[str, pd.DataFrame]:
    if not path.exists():
        raise FileNotFoundError(path)
    # Excel前两行是展示标题与说明，第3行才是结构化字段名。
    return pd.read_excel(path, sheet_name=None, header=2)


def terms(text: str) -> list[str]:
    text = re.sub(r"[^0-9A-Za-z\u4e00-\u9fff]+", " ", str(text).lower())
    chunks = [x for x in text.split() if x]
    chars = [c for c in text if "\u4e00" <= c <= "\u9fff"]
    return list(dict.fromkeys(chunks + chars))


def retrieve(query: str, frame: pd.DataFrame, product: str | None = None) -> pd.DataFrame:
    q = terms(query)
    if not q:
        return frame.iloc[0:0].copy()
    rows = frame.copy()
    searchable = rows[["产品类别", "问题分类", "用户常见问法", "标准答案", "排查步骤"]].fillna("").astype(str).agg(" ".join, axis=1).str.lower()
    scores = []
    for idx, text in searchable.items():
        score = sum(3 if token in str(rows.at[idx, "用户常见问法"]).lower() else 1 for token in q if token in text)
        if product and product != "全部" and rows.at[idx, "产品类别"] in (product, "通用"):
            score += 4
        scores.append(score)
    rows["匹配分"] = scores
    return rows[rows["匹配分"] > 0].sort_values(["匹配分", "风险等级"], ascending=[False, False]).head(5)


try:
    data = load_data(WORKBOOK)
except Exception as exc:
    st.error(f"无法读取项目数据底座：{exc}")
    st.stop()

initialize(data)
kb = load_knowledge(published_only=True)
scripts = data["标准话术"]
questions = data["月考题库"]
scores = data["成绩明细"]
logs = load_consultations()
exam_attempts = load_exam_attempts()

st.sidebar.markdown("## 家电售后智训台")
page = st.sidebar.radio(
    "功能导航",
    ["运营总览", "AI知识检索", "咨询登记", "客服话术", "新人月考", "成绩分析", "知识库运营"],
)
st.sidebar.markdown("---")
st.sidebar.caption("个人模拟项目 · 通用家电场景")
st.sidebar.caption("数据源：本地Excel知识底座")

st.markdown(
    '<div class="hero"><h1>AI赋能家电售后知识库与客服培训体系</h1>'
    '<p>知识准确 · 快速检索 · 培训考核 · 数据迭代</p></div>',
    unsafe_allow_html=True,
)

if page == "运营总览":
    avg_score = pd.to_numeric(scores["总分"], errors="coerce").mean()
    pass_rate = scores["是否及格"].eq("及格").mean()
    c1, c2, c3, c4 = st.columns(4)
    c1.metric("知识条目", len(kb))
    c2.metric("高风险条目", int(kb["风险等级"].eq("高").sum()))
    c3.metric("团队平均分", f"{avg_score:.1f}")
    c4.metric("考试及格率", f"{pass_rate:.0%}")
    if not exam_attempts.empty:
        st.caption(f"平台已保存 {len(exam_attempts)} 次真实演示考试记录；上方团队指标来自初始培训样本。")

    left, right = st.columns([1.15, 1])
    with left:
        st.subheader("咨询主题分布")
        topic_counts = logs["咨询主题"].value_counts().head(8)
        st.bar_chart(topic_counts, color="#2D7F7A", horizontal=True)
    with right:
        st.subheader("本期运营提醒")
        gap_count = int(logs["知识缺口"].eq("是").sum())
        high_people = int(scores["辅导优先级"].eq("高").sum())
        st.warning(f"发现 {gap_count} 条知识缺口记录，需要补充渠道流程或配件适配信息。")
        st.error(f"有 {high_people} 名客服需要优先专项辅导与补考。")
        st.info("高风险咨询必须先执行停用、断电或升级机制，再处理体验问题。")

    st.subheader("知识运营闭环")
    st.markdown("资料审核 → 结构化知识库 → AI检索与标准话术 → 新人培训/月考 → 数据分析 → 专项辅导与知识迭代")

elif page == "AI知识检索":
    st.subheader("客服问题检索")
    products = ["全部"] + sorted(kb["产品类别"].dropna().astype(str).unique().tolist())
    product = st.selectbox("产品类别", products)
    query = st.text_input("输入用户问题", placeholder="例如：养生壶用的时候有刺鼻气味，还冒烟怎么办？")
    st.caption("回答只来自已审核知识库；找不到可靠依据时会提示转人工核实。")

    if query:
        matches = retrieve(query, kb, product)
        if matches.empty:
            st.warning("知识库中没有找到足够依据。建议记录问题细节，并转产品或售后人员人工核实。")
        else:
            best = matches.iloc[0]
            risk = str(best["风险等级"])
            safety_words = ("冒烟", "火花", "漏电", "触电", "焦糊", "电源线破损", "自动断电失效")
            if any(word in query for word in safety_words):
                risk = "高"
            if risk == "高":
                st.error("高风险问题：优先执行安全提醒，并按升级条件转人工处理。")
            elif risk == "中":
                st.warning("中风险问题：完成必要信息核对后再答复，不可提前承诺。")
            st.markdown(
                f'<div class="answer"><b>推荐回复</b><br>{best["标准答案"]}<br><br>'
                f'<b>排查步骤</b><br>{best["排查步骤"]}<br><br>'
                f'<b>客服行动</b><br>{best["客服行动"]}</div>',
                unsafe_allow_html=True,
            )
            a, b, c, d = st.columns(4)
            a.metric("知识编号", best["知识ID"])
            b.metric("风险等级", risk)
            c.metric("版本", best["版本号"])
            d.metric("匹配分", int(best["匹配分"]))
            st.caption(f"升级条件：{best['升级条件']}｜信息性质：{best['信息性质']}｜更新时间：{pd.to_datetime(best['更新时间']).date()}")
            with st.expander("查看其他可能匹配的知识"):
                st.dataframe(matches[["知识ID", "产品类别", "问题分类", "用户常见问法", "风险等级", "匹配分"]], hide_index=True, width="stretch")

elif page == "咨询登记":
    st.subheader("用户咨询登记")
    st.caption("提交后写入本地数据库，并自动进入运营总览和知识缺口分析。")
    with st.form("consultation_form", clear_on_submit=True):
        c1, c2 = st.columns(2)
        agent = c1.text_input("客服姓名", value="演示客服")
        product = c2.selectbox("产品类别", ["养生壶", "电热水壶", "空气炸锅", "通用"])
        topic = c1.text_input("咨询主题", placeholder="例如：异味、漏水、退换货")
        matched_id = c2.text_input("匹配知识ID", placeholder="例如：KB002；未匹配可留空")
        question_text = st.text_area("用户问题摘要", placeholder="记录用户原始问题和关键现象")
        d1, d2, d3 = st.columns(3)
        resolution = d1.selectbox("处理结果", ["是", "部分", "升级", "否"])
        risk = d2.selectbox("风险等级", ["低", "中", "高"])
        gap = d3.selectbox("知识缺口", ["否", "是"])
        suggestion = st.text_area("迭代建议", placeholder="如有知识缺口，请描述需要补充的内容")
        submitted_consult = st.form_submit_button("保存咨询记录", type="primary", width="stretch")
    if submitted_consult:
        if not topic.strip() or not question_text.strip():
            st.error("请填写咨询主题和用户问题摘要。")
        else:
            record_id = add_consultation({
                "客服姓名":agent.strip() or "演示客服", "产品类别":product, "咨询主题":topic.strip(),
                "用户问题摘要":question_text.strip(), "匹配知识ID":matched_id.strip(), "是否解决":resolution,
                "风险等级":risk, "知识缺口":gap, "迭代建议":suggestion.strip(),
            })
            st.cache_data.clear()
            st.success(f"咨询记录已保存，数据库记录号：{record_id}")
    st.markdown("#### 最近咨询记录")
    st.dataframe(load_consultations().head(10), hide_index=True, width="stretch")

elif page == "客服话术":
    st.subheader("标准话术检索")
    scenario = st.selectbox("选择服务环节", ["全部"] + sorted(scripts["环节"].unique().tolist()))
    filtered = scripts if scenario == "全部" else scripts[scripts["环节"] == scenario]
    for _, row in filtered.iterrows():
        with st.expander(f"{row['环节']}｜{row['适用场景']}｜风险：{row['风险等级']}"):
            st.success(row["推荐话术"])
            st.write(f"**表达目标：** {row['表达目标']}")
            st.write(f"**禁用表达：** {row['禁用表达']}")

elif page == "新人月考":
    st.subheader("新人客服知识月考")
    st.caption("系统随机抽取10题，每题按题库分值计分；提交后展示错题和对应模块。")
    if "exam_ids" not in st.session_state:
        st.session_state.exam_ids = questions.sample(10, random_state=24)["题号"].tolist()
    exam = questions[questions["题号"].isin(st.session_state.exam_ids)].copy()
    answers: dict[str, str] = {}
    labels = {"A": "选项A", "B": "选项B", "C": "选项C", "D": "选项D"}
    with st.form("exam_form"):
        employee = st.text_input("考试人员", value="演示学员")
        for pos, (_, row) in enumerate(exam.iterrows(), 1):
            st.markdown(f"**{pos}. [{row['模块']}] {row['题目']}**")
            opts = [key for key, col in labels.items() if pd.notna(row[col]) and str(row[col]).strip()]
            answers[row["题号"]] = st.radio("请选择", opts, format_func=lambda x, r=row: f"{x}. {r[labels[x]]}", key=f"ans_{row['题号']}", horizontal=True, label_visibility="collapsed")
        submitted = st.form_submit_button("提交试卷", type="primary", width="stretch")
    if submitted:
        full = int(exam["分值"].sum())
        earned = 0
        wrong = []
        for _, row in exam.iterrows():
            if answers[row["题号"]] == str(row["答案"]):
                earned += int(row["分值"])
            else:
                wrong.append(row)
        pct = earned / full if full else 0
        st.metric("本次得分", f"{earned}/{full}", f"正确率 {pct:.0%}")
        if pct >= 0.8:
            st.success("达到及格线。建议继续复习错题对应模块。")
        else:
            st.error("未达到80%及格线，建议完成专项辅导后补考。")
        if wrong:
            st.markdown("#### 错题复盘")
            for row in wrong:
                st.write(f"- {row['题号']}｜{row['模块']}｜正确答案：{row['答案']}｜{row['题目']}")
        weak_modules = "、".join(sorted({str(row["模块"]) for row in wrong})) or "无"
        attempt_id = save_exam(employee.strip() or "演示学员", earned, full, weak_modules)
        st.caption(f"考试结果已保存至本地数据库，记录号：{attempt_id}")

elif page == "成绩分析":
    st.subheader("培训与考试成绩分析")
    display_scores = scores[["员工编号", "姓名", "总分", "是否及格", "薄弱模块", "辅导优先级", "备注"]].copy()
    st.dataframe(
        display_scores.style.background_gradient(subset=["总分"], cmap="RdYlGn", vmin=60, vmax=100),
        hide_index=True,
        width="stretch",
    )
    left, right = st.columns(2)
    with left:
        st.subheader("个人成绩")
        st.bar_chart(scores.set_index("姓名")["总分"], color="#2D7F7A")
    with right:
        st.subheader("薄弱模块人数")
        st.bar_chart(scores["薄弱模块"].value_counts(), color="#D8A547")

elif page == "知识库运营":
    st.subheader("知识库维护与迭代")
    product_filter = st.multiselect("筛选产品", sorted(kb["产品类别"].unique().tolist()))
    risk_filter = st.multiselect("筛选风险", ["高", "中", "低"])
    view = kb.copy()
    if product_filter:
        view = view[view["产品类别"].isin(product_filter)]
    if risk_filter:
        view = view[view["风险等级"].isin(risk_filter)]
    st.dataframe(view, hide_index=True, width="stretch", height=430)
    st.download_button(
        "下载当前知识清单 CSV",
        view.to_csv(index=False).encode("utf-8-sig"),
        "家电售后知识清单.csv",
        "text/csv",
        width="stretch",
    )
    st.markdown("#### 待迭代问题")
    gaps = logs[logs["知识缺口"].eq("是")][["产品类别", "咨询主题", "用户问题摘要", "迭代建议"]]
    st.dataframe(gaps, hide_index=True, width="stretch")
    st.markdown("#### 新增知识条目")
    with st.form("new_knowledge", clear_on_submit=True):
        k1, k2, k3 = st.columns(3)
        k_product = k1.selectbox("产品类别", ["养生壶", "电热水壶", "空气炸锅", "通用"], key="k_product")
        k_category = k2.text_input("问题分类", key="k_category")
        k_risk = k3.selectbox("风险等级", ["低", "中", "高"], key="k_risk")
        k_question = st.text_input("用户常见问法", key="k_question")
        k_answer = st.text_area("标准答案", key="k_answer")
        k_steps = st.text_area("排查步骤", key="k_steps")
        k_action = st.text_input("客服行动", key="k_action")
        k_escalation = st.text_input("升级条件", key="k_escalation")
        k4, k5 = st.columns(2)
        k_info_type = k4.selectbox("信息性质", ["公开产品资料", "通用操作建议", "安全边界建议", "模拟流程规则"], key="k_info_type")
        k_source = k5.text_input("信息来源", value="个人模拟项目", key="k_source")
        add_submitted = st.form_submit_button("提交待审核", type="primary", width="stretch")
    if add_submitted:
        if not k_category.strip() or not k_question.strip() or not k_answer.strip():
            st.error("问题分类、用户常见问法和标准答案为必填项。")
        else:
            new_id = add_knowledge({
                "产品类别":k_product, "问题分类":k_category.strip(), "用户常见问法":k_question.strip(),
                "标准答案":k_answer.strip(), "排查步骤":k_steps.strip(), "客服行动":k_action.strip(),
                "风险等级":k_risk, "升级条件":k_escalation.strip(), "信息性质":k_info_type,
                "信息来源":k_source.strip() or "个人模拟项目",
            })
            st.success(f"{new_id} 已保存为待审核，审核发布后才会进入AI检索。")
    st.markdown("#### 审核与发布")
    all_kb = load_knowledge(published_only=False)
    pending = all_kb[all_kb["审核状态"].ne("已发布")]
    if pending.empty:
        st.info("当前没有待审核知识。")
    else:
        st.dataframe(pending[["知识ID","产品类别","问题分类","用户常见问法","风险等级","信息来源","审核状态"]], hide_index=True, width="stretch")
        review_id = st.selectbox("选择知识ID", pending["知识ID"].tolist())
        r1, r2 = st.columns(2)
        if r1.button("审核通过并发布", type="primary", width="stretch"):
            set_review_status(review_id, "已发布")
            st.success(f"{review_id} 已发布，刷新后进入AI检索。")
        if r2.button("退回修改", width="stretch"):
            set_review_status(review_id, "已退回")
            st.warning(f"{review_id} 已退回修改。")

st.markdown("---")
st.markdown('<div class="small-note">声明：本平台为个人模拟项目，数据、规则和人员均为虚构，不代表任何企业真实售后政策。</div>', unsafe_allow_html=True)
