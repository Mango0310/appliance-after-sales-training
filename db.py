from __future__ import annotations

import sqlite3
from datetime import datetime
from pathlib import Path

import pandas as pd


DB_PATH = Path(__file__).resolve().parent / "data" / "售后智训台.db"


def connect() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def initialize(excel_data: dict[str, pd.DataFrame]) -> None:
    with connect() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS knowledge (
                knowledge_id TEXT PRIMARY KEY,
                product TEXT NOT NULL,
                category TEXT NOT NULL,
                question TEXT NOT NULL,
                answer TEXT NOT NULL,
                steps TEXT,
                action TEXT,
                risk TEXT NOT NULL,
                escalation TEXT,
                info_type TEXT,
                version TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                source TEXT DEFAULT '个人模拟项目',
                review_status TEXT DEFAULT '已发布'
            );
            CREATE TABLE IF NOT EXISTS consultations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                created_at TEXT NOT NULL,
                product TEXT NOT NULL,
                topic TEXT NOT NULL,
                question TEXT NOT NULL,
                matched_id TEXT,
                resolution TEXT NOT NULL,
                risk TEXT NOT NULL,
                knowledge_gap TEXT NOT NULL,
                suggestion TEXT,
                agent TEXT
            );
            CREATE TABLE IF NOT EXISTS exam_attempts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                created_at TEXT NOT NULL,
                employee TEXT NOT NULL,
                earned INTEGER NOT NULL,
                full_score INTEGER NOT NULL,
                accuracy REAL NOT NULL,
                passed TEXT NOT NULL,
                weak_modules TEXT
            );
            """
        )
        if conn.execute("SELECT COUNT(*) FROM knowledge").fetchone()[0] == 0:
            rows = excel_data["售后知识库"].fillna("").to_dict("records")
            conn.executemany(
                """INSERT INTO knowledge VALUES
                (:知识ID,:产品类别,:问题分类,:用户常见问法,:标准答案,:排查步骤,:客服行动,
                 :风险等级,:升级条件,:信息性质,:版本号,:更新时间,'个人模拟项目','已发布')""",
                [{**row, "更新时间": str(pd.to_datetime(row["更新时间"]).date())} for row in rows],
            )
        if conn.execute("SELECT COUNT(*) FROM consultations").fetchone()[0] == 0:
            rows = excel_data["咨询记录"].fillna("").to_dict("records")
            conn.executemany(
                """INSERT INTO consultations
                (created_at,product,topic,question,matched_id,resolution,risk,knowledge_gap,suggestion,agent)
                VALUES (:日期,:产品类别,:咨询主题,:用户问题摘要,:匹配知识ID,:是否解决,:风险等级,:知识缺口,:迭代建议,'模拟客服')""",
                [{**row, "日期": str(pd.to_datetime(row["日期"]).date())} for row in rows],
            )


def load_knowledge(published_only: bool = False) -> pd.DataFrame:
    sql = "SELECT * FROM knowledge"
    if published_only:
        sql += " WHERE review_status='已发布'"
    sql += " ORDER BY knowledge_id"
    with connect() as conn:
        df = pd.read_sql_query(sql, conn)
    return df.rename(columns={
        "knowledge_id":"知识ID", "product":"产品类别", "category":"问题分类",
        "question":"用户常见问法", "answer":"标准答案", "steps":"排查步骤",
        "action":"客服行动", "risk":"风险等级", "escalation":"升级条件",
        "info_type":"信息性质", "version":"版本号", "updated_at":"更新时间",
        "source":"信息来源", "review_status":"审核状态",
    })


def add_knowledge(values: dict[str, str]) -> str:
    with connect() as conn:
        n = conn.execute("SELECT COUNT(*) FROM knowledge").fetchone()[0] + 1
        knowledge_id = f"KB{n:03d}"
        while conn.execute("SELECT 1 FROM knowledge WHERE knowledge_id=?", (knowledge_id,)).fetchone():
            n += 1
            knowledge_id = f"KB{n:03d}"
        conn.execute(
            """INSERT INTO knowledge
            (knowledge_id,product,category,question,answer,steps,action,risk,escalation,info_type,version,updated_at,source,review_status)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (knowledge_id, values["产品类别"], values["问题分类"], values["用户常见问法"],
             values["标准答案"], values["排查步骤"], values["客服行动"], values["风险等级"],
             values["升级条件"], values["信息性质"], "V1.0", datetime.now().date().isoformat(),
             values["信息来源"], "待审核"),
        )
    return knowledge_id


def set_review_status(knowledge_id: str, status: str) -> None:
    with connect() as conn:
        conn.execute(
            "UPDATE knowledge SET review_status=?, updated_at=? WHERE knowledge_id=?",
            (status, datetime.now().date().isoformat(), knowledge_id),
        )


def load_consultations() -> pd.DataFrame:
    with connect() as conn:
        df = pd.read_sql_query("SELECT * FROM consultations ORDER BY id DESC", conn)
    return df.rename(columns={
        "id":"记录ID", "created_at":"日期", "product":"产品类别", "topic":"咨询主题",
        "question":"用户问题摘要", "matched_id":"匹配知识ID", "resolution":"是否解决",
        "risk":"风险等级", "knowledge_gap":"知识缺口", "suggestion":"迭代建议", "agent":"客服姓名",
    })


def add_consultation(values: dict[str, str]) -> int:
    with connect() as conn:
        cur = conn.execute(
            """INSERT INTO consultations
            (created_at,product,topic,question,matched_id,resolution,risk,knowledge_gap,suggestion,agent)
            VALUES (?,?,?,?,?,?,?,?,?,?)""",
            (datetime.now().isoformat(timespec="seconds"), values["产品类别"], values["咨询主题"],
             values["用户问题摘要"], values["匹配知识ID"], values["是否解决"], values["风险等级"],
             values["知识缺口"], values["迭代建议"], values["客服姓名"]),
        )
        return int(cur.lastrowid)


def save_exam(employee: str, earned: int, full_score: int, weak_modules: str) -> int:
    accuracy = earned / full_score if full_score else 0
    with connect() as conn:
        cur = conn.execute(
            """INSERT INTO exam_attempts
            (created_at,employee,earned,full_score,accuracy,passed,weak_modules)
            VALUES (?,?,?,?,?,?,?)""",
            (datetime.now().isoformat(timespec="seconds"), employee, earned, full_score, accuracy,
             "及格" if accuracy >= 0.8 else "不及格", weak_modules),
        )
        return int(cur.lastrowid)


def load_exam_attempts() -> pd.DataFrame:
    with connect() as conn:
        return pd.read_sql_query("SELECT * FROM exam_attempts ORDER BY id DESC", conn)
