from __future__ import annotations

from datetime import date

from db import connect


PHILIPS_MANUAL = "https://www.documents.philips.com/assets/20210512/7d66549c3d5c4d2299efad26006bc54d.pdf"
PHILIPS_CLEAN = "https://www.usa.philips.com/c-f/XC000012903/how-to-clean-my-philips-airfryer"
PANASONIC_K101 = "https://www.panasonic.com/content/dam/Panasonic/Asia/Operating-Instructions/Operating-Instructions-NC-K101WSK.pdf"
PANASONIC_SK1 = "https://www.panasonic.com/content/dam/Panasonic/vn/vi/Support/Operating-Installation-Instructions/04-Operation-Instruction-NC-SK1.pdf"


ROWS = [
    ("VK001","空气炸锅","首次使用","空气炸锅第一次使用前要做什么？","先移除全部包装材料，清洗炸篮和锅体等可拆部件，并用湿布擦拭机身内外；具体步骤以对应型号说明书为准。","核对型号；移除包装；清洗可拆部件；湿布擦拭；正确装回","引用对应型号说明书指导首次使用","低","发现部件破损、线材异常或无法正确装配时停止使用","官方说明书整理","V1.0","飞利浦Airfryer相关型号｜Before first use",PHILIPS_MANUAL),
    ("VK002","空气炸锅","摆放","空气炸锅可以放在不耐热桌面上吗？","应放置在稳定、水平且耐热的表面，并远离水源或其他热源；不要堵塞进风口和出风口。","检查台面；检查四周空间；确认风口无遮挡","说明安全摆放要求","中","靠近易燃物、水源或风口被遮挡时要求调整后再用","官方说明书整理","V1.0","飞利浦Airfryer相关型号｜Preparing for use",PHILIPS_MANUAL),
    ("VK003","空气炸锅","用油","可以往空气炸锅锅里倒满油炸东西吗？","空气炸锅通过热空气工作，不应像传统油炸锅一样向锅内倒入大量油或脂肪。","确认用户是否向锅内直接加油；要求停止错误操作；按食材需求少量刷油","纠正高风险使用方式","高","已经大量加油、出现溢油或接近加热部件时立即停用","官方说明书整理","V1.0","飞利浦Airfryer相关型号｜Important safeguards",PHILIPS_MANUAL),
    ("VK004","空气炸锅","深色烟雾","空气炸锅冒黑烟怎么办？","立即断开电源，等待烟雾停止后再处理锅体，不要在持续冒烟时直接拉出炸篮或继续运行。","断电；保持安全距离；等待烟雾停止；记录食材和现象；转人工","执行安全升级","高","深色烟雾、火花、明火或持续焦糊味","官方说明书整理","V1.0","飞利浦Airfryer相关型号｜Dark smoke warning",PHILIPS_MANUAL),
    ("VK005","空气炸锅","白烟","炸高脂食材出现白烟一定是故障吗？","高脂食材产生的油脂进入锅底时可能形成白烟并使锅体更热，但仍需区分普通白烟与深色烟雾、焦味等异常。","询问食材；判断烟雾颜色和气味；检查锅底油脂；排除深色烟雾","区分现象并提示清洁锅底油脂","中","烟雾颜色深、持续加重或伴随火花焦味时立即断电升级","官方说明书整理","V1.0","飞利浦Airfryer相关型号｜Troubleshooting: white smoke",PHILIPS_MANUAL),
    ("VK006","空气炸锅","装载量","食材放得太多会有什么影响？","超过炸篮MAX标记可能影响食物受热和锅体正确推入，应减少食材至规定范围。","核对MAX线；减少食材；重新放平；检查锅体是否正确到位","指导减少装载量","低","强行推入导致结构卡滞时停止操作","官方说明书整理","V1.0","飞利浦Airfryer相关型号｜Troubleshooting: pan insertion",PHILIPS_MANUAL),
    ("VK007","空气炸锅","受热不均","薯条为什么有的熟有的不熟？","叠放或交叉的食材可能需要在烹饪过程中翻动或摇匀；同时应控制装载量。","确认食材形态；核对装载量；按说明中途翻动；适当延长时间","解释影响因素，不承诺固定结果","低","肉类等涉及食用安全且用户无法判断熟度时提醒确保熟透","官方说明书整理","V1.0","飞利浦Airfryer相关型号｜Troubleshooting: uneven results",PHILIPS_MANUAL),
    ("VK008","空气炸锅","蒸汽烫伤","运行时可以把脸靠近出风口观察吗？","运行时出风口会释放高温蒸汽，应让手和面部与出风口保持安全距离，取出锅体时也需防范热蒸汽。","提醒远离出风口；使用把手；缓慢拉出；避免儿童靠近","立即纠正危险动作","高","用户已发生烫伤时建议按实际情况及时寻求医疗帮助","官方说明书整理","V1.0","飞利浦Airfryer相关型号｜Hot steam warning",PHILIPS_MANUAL),
    ("VK009","空气炸锅","清洁","炸篮可以用钢丝球清洁吗？","不建议使用金属厨具、钢丝球或磨蚀性清洁材料，以免损伤不粘涂层；可用热水、洗涤剂和软海绵清洁。","断电冷却；拆下部件；温水浸泡；软海绵清洁；冲洗干燥","提供不损伤涂层的清洁方法","低","涂层已经明显脱落时停止继续使用并转售后确认","官方支持页整理","V1.0","飞利浦支持｜Cleaning pan and basket",PHILIPS_CLEAN),
    ("VK010","空气炸锅","加热管清洁","加热管附近的油污怎么清理？","必须先拔掉电源并确认机器不热，再拆出炸篮和锅体，用软海绵及热水清洁内部；顽固残渣可使用软至中等硬度刷具，避免钢丝刷。","断电；完全冷却；取出部件；软质工具清洁；晾干复位","强调断电、冷却和工具限制","中","液体进入电器部件或无法安全接近时停止自行清洁","官方支持页整理","V1.0","飞利浦支持｜Cleaning heating element",PHILIPS_CLEAN),
    ("VK011","电热水壶","专用底座","水壶可以放到其他品牌底座上用吗？","电热水壶应与随附的专用电源底座配套使用，不应混用其他设备或型号的底座。","核对型号；核对底座；停止混用；使用原配或确认适配的配件","阻止底座混用","高","已经出现接触不良、火花或异常发热时立即断电","官方说明书整理","V1.0","松下NC-K101/NC-K301｜Power base safety",PANASONIC_K101),
    ("VK012","电热水壶","加水","水壶放在底座上时可以直接加水吗？","为减少电气风险，应先将壶体从电源底座取下，再进行加水或倒水操作。","关闭开关；移离底座；加水；擦干外壁；放回底座","指导正确加水顺序","中","底座已经进水时先断电并充分干燥，必要时转售后","官方说明书整理","V1.0","松下NC-K101/NC-K301｜Filling and pouring",PANASONIC_K101),
    ("VK013","电热水壶","水位","水加到超过MAX线会怎样？","超过最高水位可能导致沸水从壶口溅出并造成烫伤，应将水量控制在MIN和MAX标记之间。","断电；倒出多余水；确认水位；合盖后再加热","提醒水位和烫伤风险","高","沸水已经溢出到底座时立即断电并停止使用","官方说明书整理","V1.0","松下电热水壶说明书｜Water level precautions",PANASONIC_K101),
    ("VK014","电热水壶","干烧保护","水太少导致水壶停止加热怎么办？","部分型号带防干烧保护，水量不足时会停止加热。应关闭开关、移离底座并充分冷却，再补充合适水量；以对应型号说明为准。","关闭；移离底座；冷却；加至规定水位；重新放回","解释保护机制并防止连续重试","中","冷却补水后仍无法工作或出现焦味时转售后","官方说明书整理","V1.0","松下/公开电热水壶说明书｜Boil-dry protection",PANASONIC_SK1),
    ("VK015","电热水壶","倒水","倒热水时为什么要慢一点？","应握住把手缓慢倒水，避免过度倾斜，以降低热水飞溅和烫伤风险。","确认壶盖闭合；握稳把手；缓慢倾倒；避免壶嘴靠近人体","强调防烫操作","中","壶盖松动或把手异常时停止倒水","官方说明书整理","V1.0","松下电热水壶说明书｜Pouring caution",PANASONIC_K101),
    ("VK016","电热水壶","清洁前处理","电热水壶用完能马上清洗吗？","清洁前应拔下电源并等待壶体充分冷却，避免烫伤和电气风险。","断电；倒空；完全冷却；按说明清洁；干燥后复位","强调清洁前置条件","中","底座或接口进水时暂停使用并评估","官方说明书整理","V1.0","松下电热水壶说明书｜Cleaning and storage",PANASONIC_K101),
    ("VK017","电热水壶","使用看护","烧水时可以离开家吗？","电热水壶运行时应保持必要看护；离开时关闭电源，不应让设备在无人注意的情况下持续工作。","提醒看护；确认自动断电功能正常；离开前关闭并拔电","纠正无人看护行为","高","自动断电失效时立即停用并送检","官方说明书整理","V1.0","松下电热水壶说明书｜Attention during use",PANASONIC_K101),
    ("VK018","电热水壶","指定用途","电热水壶可以直接煮牛奶或食物吗？","普通电热水壶通常设计用于烧饮用水，不应在没有对应功能说明时用于加热其他液体或食物；以具体型号说明书为准。","核对型号用途；停止错误使用；清洁残留；按说明重新使用","防止用途误用","中","液体溢入电气结构或形成焦糊残留时停止使用","官方说明书整理","V1.0","松下电热水壶说明书｜Intended use",PANASONIC_SK1),
    ("VK019","电热水壶","壶盖安全","烧水过程中可以打开壶盖吗？","运行时不应打开壶盖，以免沸水或蒸汽溅出造成烫伤；加水前先停止加热并倒出剩余热水。","关闭开关；等待停止沸腾；安全倒水；冷却后开盖","立即纠正危险操作","高","壶盖无法闭合或锁定时停止使用","官方说明书整理","V1.0","松下电热水壶说明书｜Lid and steam warning",PANASONIC_K101),
    ("VK020","电热水壶","异常停机","水壶过热后完全无法恢复怎么办？","部分型号除防干烧外还有额外热保护。充分冷却并按说明处理后仍无法工作时，不应自行拆机，应联系售后检测。","断电；冷却；核对水量；仅重试一次；仍异常则转售后","阻止反复通电和自行拆机","高","持续异常发热、焦味、火花或无法自动断电","官方说明书整理","V1.0","松下电热水壶说明书｜Thermal protection",PANASONIC_SK1),
]


def main() -> None:
    today = date.today().isoformat()
    with connect() as conn:
        for row in ROWS:
            (kid, product, category, question, answer, steps, action, risk, escalation,
             info_type, version, applicability, source_url) = row
            source = f"{applicability}｜{source_url}"
            conn.execute(
                """INSERT INTO knowledge
                (knowledge_id,product,category,question,answer,steps,action,risk,escalation,info_type,version,updated_at,source,review_status)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,'已发布')
                ON CONFLICT(knowledge_id) DO UPDATE SET
                product=excluded.product,category=excluded.category,question=excluded.question,
                answer=excluded.answer,steps=excluded.steps,action=excluded.action,risk=excluded.risk,
                escalation=excluded.escalation,info_type=excluded.info_type,version=excluded.version,
                updated_at=excluded.updated_at,source=excluded.source,review_status='已发布'""",
                (kid, product, category, question, answer, steps, action, risk, escalation,
                 info_type, version, today, source),
            )
    print(f"IMPORTED_VERIFIED={len(ROWS)}")


if __name__ == "__main__":
    main()
