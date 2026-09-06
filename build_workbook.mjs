import fs from "node:fs/promises";
import { Workbook, SpreadsheetFile } from "@oai/artifact-tool";

const outDir = "outputs/家电售后知识库项目";
await fs.mkdir(outDir, { recursive: true });

const wb = Workbook.create();
const dashboard = wb.worksheets.add("项目看板");
const kb = wb.worksheets.add("售后知识库");
const scripts = wb.worksheets.add("标准话术");
const questions = wb.worksheets.add("月考题库");
const scores = wb.worksheets.add("成绩明细");
const analysis = wb.worksheets.add("模块分析");
const logs = wb.worksheets.add("咨询记录");

const navy = "#20364A", teal = "#2D7F7A", pale = "#EAF4F2", gold = "#D8A547";
const red = "#C94C4C", green = "#3D8B6D", gray = "#64748B", light = "#F5F7F9";

function title(sheet, range, text, subtitle) {
  sheet.getRange(range).merge();
  const cell = sheet.getRange(range.split(":")[0]);
  cell.values = [[text]];
  cell.format = { fill: navy, font: { bold: true, color: "#FFFFFF", size: 18 }, verticalAlignment: "center" };
  sheet.getRange(range).format.rowHeight = 34;
  if (subtitle) {
    const row = Number(range.match(/\d+/)[0]) + 1;
    sheet.getRange(`A${row}:H${row}`).merge();
    sheet.getRange(`A${row}`).values = [[subtitle]];
    sheet.getRange(`A${row}`).format = { fill: pale, font: { color: navy, italic: true, size: 10 }, wrapText: true };
    sheet.getRange(`A${row}:H${row}`).format.rowHeight = 28;
  }
  sheet.showGridLines = false;
}

function header(range) {
  range.format = { fill: teal, font: { bold: true, color: "#FFFFFF" }, verticalAlignment: "center", wrapText: true,
    borders: { bottom: { style: "medium", color: navy } } };
  range.format.rowHeight = 28;
}

function body(range) {
  range.format = { font: { color: "#243442", size: 10 }, verticalAlignment: "top", wrapText: true,
    borders: { insideHorizontal: { style: "thin", color: "#DCE3E8" } } };
}

title(kb, "A1:L1", "家电售后知识库", "个人模拟项目｜政策条目均为模拟规则；实际工作中须以企业审核文件为准");
const kbHeaders = ["知识ID","产品类别","问题分类","用户常见问法","标准答案","排查步骤","客服行动","风险等级","升级条件","信息性质","版本号","更新时间"];
const kbRows = [
 ["KB001","养生壶","首次使用","新壶第一次怎么用？","清洗壶体后加清水至适中水位，完成一次烧水并倒掉，再正常使用。","1. 检查包装及配件 2. 清洗壶内 3. 加清水试烧 4. 倒掉试烧用水","指导用户完成首次清洁与试烧","低","出现破损、漏电或明显异味不消失","通用操作建议","V1.0",new Date("2026-08-30")],
 ["KB002","养生壶","异味","使用时有塑料味怎么办？","首次使用的轻微气味可先清洗和试烧；若气味持续、刺鼻或伴随冒烟，请立即停止使用并转人工核查。","1. 确认是否首次使用 2. 清洗并清水试烧 3. 判断是否刺鼻/冒烟 4. 必要时停机","先安抚，再按风险分级处理","中","刺鼻、冒烟、焦糊味或多次清洗后仍持续","安全边界建议","V1.0",new Date("2026-08-30")],
 ["KB003","养生壶","水垢清洁","壶底有白色斑点是不是坏了？","多数白色斑点可能是水中矿物质形成的水垢，可断电冷却后按说明进行除垢。","1. 确认斑点位置 2. 排除涂层脱落 3. 断电冷却 4. 使用适配清洁方式","解释原因并提供清洁步骤","低","表面脱落、裂纹或清洁后异常仍存在","通用维护建议","V1.0",new Date("2026-08-30")],
 ["KB004","养生壶","不加热","通电了但不加热怎么办？","请先确认插座、电源连接、壶体放置和模式设置；仍不加热时停止反复尝试并转售后检测。","1. 测试插座 2. 重放壶体 3. 检查模式 4. 冷却后重试一次 5. 转检测","完成基础排查后升级","中","反复断电、焦味、异常发热或排查无效","故障排查建议","V1.0",new Date("2026-08-30")],
 ["KB005","养生壶","溢出","煮东西总是溢出来怎么办？","食材含淀粉或起泡较多时更易溢出，请减少食材和水量，并选用适合的功能，勿超过规定水位。","1. 询问食材 2. 核对水位 3. 核对功能 4. 建议减少用量","说明使用边界并提醒看护","中","液体进入底座或电器部件","通用操作建议","V1.0",new Date("2026-08-30")],
 ["KB006","电热水壶","不通电","按开关没反应","请确认插座正常、底座接触良好且壶内水量合适；若电源线破损或有烧焦痕迹，应立即停用。","1. 检查插座 2. 检查底座 3. 检查水位 4. 观察线材与焦痕","安全优先，必要时停止排查","高","线材破损、漏电感、焦痕或冒烟","安全边界建议","V1.0",new Date("2026-08-30")],
 ["KB007","电热水壶","自动断电","水开了不断电怎么办？","请立即手动断电并停止使用，不建议用户自行拆机，需转售后检测。","1. 手动断电 2. 冷却 3. 停止使用 4. 记录现象并转售后","立即升级安全故障","高","自动断电功能失效","安全边界建议","V1.0",new Date("2026-08-30")],
 ["KB008","电热水壶","噪声","烧水声音特别大正常吗？","加热过程中产生一定声音通常与水质、水垢和沸腾有关；如伴随剧烈震动、焦味或漏水需停用检查。","1. 判断声音类型 2. 检查水垢 3. 检查放置 4. 排除伴随风险","区分正常现象与异常风险","低","剧烈震动、漏水、焦味","通用故障排查","V1.0",new Date("2026-08-30")],
 ["KB009","电热水壶","漏水","底座附近有水怎么办？","请先断电并擦干周边，确认是加水洒出、壶嘴回流还是壶体渗漏；疑似壶体渗漏时停止使用。","1. 断电 2. 擦干 3. 判断水源 4. 疑似渗漏则停用","先消除触电风险，再判断原因","高","底座进水或壶体持续渗漏","安全边界建议","V1.0",new Date("2026-08-30")],
 ["KB010","空气炸锅","首次使用","第一次用要空烧吗？","请以对应产品说明书为准。通常应先清洗可拆部件并去除包装材料，是否空烧不得脱离说明书自行承诺。","1. 核对型号 2. 查对应说明书 3. 清洗可拆件 4. 按说明操作","要求引用对应型号资料","中","无法确认型号或说明书要求","准确性控制","V1.0",new Date("2026-08-30")],
 ["KB011","空气炸锅","冒烟","使用时冒烟怎么办？","少量油烟可能与高油脂食材有关；若是浓烟、焦糊味或持续异常，请立即断电并在安全条件下停止使用。","1. 判断烟量颜色 2. 询问食材 3. 检查残渣油脂 4. 浓烟立即停用","按安全等级处理，不淡化风险","高","浓烟、火花、焦糊味或机身异常发热","安全边界建议","V1.0",new Date("2026-08-30")],
 ["KB012","空气炸锅","食物不熟","按时间做完里面还是生的","烹饪效果受食材大小、数量、初始温度和摆放影响，可减少份量、翻面并适当延长时间，肉类需确保熟透。","1. 核对食材和份量 2. 是否预热 3. 是否翻面 4. 调整时间温度","提供变量化排查，不承诺固定结果","低","涉及食用安全且用户无法判断熟度","通用烹饪建议","V1.0",new Date("2026-08-30")],
 ["KB013","空气炸锅","清洁","加热管附近怎么清洁？","必须断电并完全冷却后清洁，避免液体进入机身，不可使用可能损伤表面的尖锐工具。","1. 断电冷却 2. 取出可拆件 3. 轻柔清洁 4. 充分干燥","强调断电与防进水","中","油污接触电器部件或无法安全清洁","通用维护建议","V1.0",new Date("2026-08-30")],
 ["KB014","通用","退换货","买了几天可以退吗？","退换货条件需根据购买渠道、商品状态和有效售后政策核实，客服不可在未查询订单前直接承诺。","1. 核对渠道 2. 核对订单时间 3. 核对商品状态 4. 查询有效政策","查询订单与政策后答复","中","超出常规范围、已使用或存在争议","模拟流程规则","V1.0",new Date("2026-08-30")],
 ["KB015","通用","保修","保修多久？","保修范围和期限应以对应型号、购买凭证及当前有效政策为准，请先核对订单和产品信息。","1. 核对型号 2. 核对购买时间 3. 查凭证 4. 查有效政策","不得凭记忆承诺期限","中","无凭证、跨渠道或政策冲突","模拟流程规则","V1.0",new Date("2026-08-30")],
 ["KB016","通用","发票","怎么开发票？","请先核对购买渠道和订单信息，再按该渠道当前开票流程协助处理。","1. 核对渠道 2. 核对订单 3. 收集抬头信息 4. 按流程提交","保护用户信息并核对抬头","低","订单主体与开票主体不一致","模拟流程规则","V1.0",new Date("2026-08-30")],
 ["KB017","通用","配件","配件丢了能单买吗？","请确认产品型号和缺失配件名称，再查询当前配件库存及适配关系，避免推荐不兼容配件。","1. 核对型号 2. 确认配件 3. 查适配表 4. 查库存","先确认适配再提供购买路径","低","型号不清或配件涉及安全功能","模拟流程规则","V1.0",new Date("2026-08-30")],
 ["KB018","通用","物流破损","收到货外箱和机器都破了","很抱歉影响您的收货体验。请先停止使用并保留包装、商品及物流面单照片，我们将根据订单渠道协助登记处理。","1. 安抚 2. 提醒停用 3. 收集照片 4. 核对订单 5. 发起流程","避免让用户继续通电测试","高","明显破损、玻璃裂纹或电气部件暴露","模拟流程规则","V1.0",new Date("2026-08-30")],
 ["KB019","通用","投诉升级","我要投诉你们","理解您现在的不满，我会先完整记录问题和您的诉求，并尽快按流程为您升级处理。","1. 不打断 2. 复述问题 3. 确认诉求 4. 记录证据 5. 升级","不争辩、不随意承诺赔偿","高","人身安全、媒体曝光、监管投诉或重大财损","服务处理规范","V1.0",new Date("2026-08-30")],
 ["KB020","通用","隐私保护","客服能让我发身份证吗？","仅在明确业务依据和授权流程下收集必要信息，不应通过非授权渠道索取或传播敏感个人信息。","1. 确认业务必要性 2. 使用授权渠道 3. 最小化收集 4. 避免留存扩散","不索取非必要敏感信息","高","涉及身份证、银行卡、验证码等敏感信息","服务处理规范","V1.0",new Date("2026-08-30")]
];
kb.getRange("A3:L3").values = [kbHeaders]; header(kb.getRange("A3:L3"));
kb.getRange(`A4:L${3+kbRows.length}`).values = kbRows; body(kb.getRange(`A4:L${3+kbRows.length}`));
kb.getRange(`L4:L${3+kbRows.length}`).format.numberFormat = "yyyy-mm-dd";
kb.tables.add(`A3:L${3+kbRows.length}`, true, "KnowledgeBaseTable").style = "TableStyleMedium2";
kb.freezePanes.freezeRows(3); kb.freezePanes.freezeColumns(3);
[12,14,14,24,40,42,24,10,28,16,10,13].forEach((w,i)=>kb.getRangeByIndexes(0,i,3+kbRows.length,1).format.columnWidth=w);

title(scripts, "A1:H1", "客服标准话术库", "话术用于辅助表达，最终处理必须服从知识库、订单事实和有效政策");
const scriptRows = [
 ["SC001","开场","通用咨询","您好，很高兴为您服务。请问您使用的是哪类产品、具体型号是什么？我先帮您准确核对。","明确产品和型号","直接猜测型号","低","信息确认"],
 ["SC002","澄清","故障描述不清","为了避免判断偏差，我想再确认一下：异常是在通电后立即出现，还是运行一段时间后出现？","缩小问题范围","连续抛出过多问题","低","问题诊断"],
 ["SC003","安全提醒","冒烟/焦味","为了安全，请您先断开电源并停止使用，不建议再次通电测试。我会马上为您登记并升级处理。","先停用再处理","这应该没事，可以再试试","高","安全故障"],
 ["SC004","情绪安抚","用户不满","确实给您带来了不便，我理解您的着急。我先把问题和您的诉求完整记录下来，再给您明确下一步。","共情并推进处理","您先冷静一下","中","投诉处理"],
 ["SC005","政策核对","退换货","我先为您核对购买渠道、订单时间和商品状态，再依据当前有效政策给您准确答复。","不提前承诺","肯定可以退","中","政策咨询"],
 ["SC006","无法确认","知识库无答案","这个情况我暂时没有足够依据直接判断。为了不给您错误信息，我会记录细节并向产品/售后同事核实。","坦诚说明并升级","凭经验编一个答案","中","知识缺口"],
 ["SC007","处理总结","基础排查完成","我们刚才已经确认了电源、放置和模式设置，目前问题仍存在。下一步我会为您转售后检测，请您暂时停止使用。","总结事实与下一步","让用户重复全部信息","中","故障升级"],
 ["SC008","结束语","问题已解决","很高兴问题已经解决。我再提醒您后续按说明书要求使用和清洁；如果再次出现异常，可以随时联系我们。","确认解决并补充提醒","还有别的吗？没有就结束了","低","服务闭环"],
 ["SC009","隐私保护","索取敏感信息","为保护您的信息安全，请不要发送银行卡密码或验证码。需要的订单信息请通过官方授权渠道提交。","最小化收集","把验证码发我","高","隐私安全"],
 ["SC010","配件咨询","适配关系不明","为了避免买错，请您提供机身铭牌上的型号和配件名称，我核对适配关系后再给您购买建议。","先核对适配","看起来差不多，都能用","低","配件适配"]
];
scripts.getRange("A3:H3").values=[["话术ID","环节","适用场景","推荐话术","表达目标","禁用表达","风险等级","关联模块"]]; header(scripts.getRange("A3:H3"));
scripts.getRange(`A4:H${3+scriptRows.length}`).values=scriptRows; body(scripts.getRange(`A4:H${3+scriptRows.length}`));
scripts.tables.add(`A3:H${3+scriptRows.length}`,true,"ScriptsTable").style="TableStyleMedium2";
scripts.freezePanes.freezeRows(3); [12,12,20,48,25,30,10,16].forEach((w,i)=>scripts.getRangeByIndexes(0,i,3+scriptRows.length,1).format.columnWidth=w);

title(questions, "A1:J1", "客服月考题库", "满分100分｜产品知识30分、故障排查30分、售后流程20分、服务规范20分");
const qRows = [
 ["Q001","产品知识","单选","养生壶首次使用最合适的处理是？","直接煮食材","清洗并按说明完成试烧","空壶长时间加热","拆开底座检查","B",3,"基础"],
 ["Q002","安全故障","单选","电热水壶自动断电失效时应？","继续观察","反复测试","手动断电并停用升级","自行拆机","C",4,"核心"],
 ["Q003","故障排查","判断","用户称底座附近有水，应先指导断电并确认水的来源。","正确","错误","","","A",3,"核心"],
 ["Q004","服务规范","单选","知识库没有答案时，最佳做法是？","凭经验回答","说明暂无法确认并升级核实","转移话题","直接结束","B",3,"核心"],
 ["Q005","售后流程","单选","回答退换货问题前最不需要确认的是？","购买渠道","订单时间","商品状态","用户星座","D",3,"基础"],
 ["Q006","安全故障","判断","空气炸锅出现浓烟时，可以建议用户再次通电以录制视频。","正确","错误","","","B",4,"核心"],
 ["Q007","产品知识","单选","养生壶白色斑点首先可能是什么？","一定是质量问题","水垢","电路故障","包装残留","B",3,"基础"],
 ["Q008","服务规范","单选","用户投诉时不恰当的表达是？","我理解您的着急","我先记录您的诉求","您先冷静一下","我会说明下一步","C",3,"核心"],
 ["Q009","隐私安全","判断","客服可通过个人聊天账号收集用户银行卡密码以便退款。","正确","错误","","","B",4,"核心"],
 ["Q010","故障排查","单选","不加热排查中应优先确认？","插座与电源连接","用户职业","购买颜色","包装尺寸","A",3,"基础"],
 ["Q011","产品知识","单选","空气炸锅食物不熟可能与什么无关？","食材大小","摆放数量","初始温度","客服工号","D",3,"基础"],
 ["Q012","售后流程","判断","保修期限可以仅凭客服记忆直接承诺。","正确","错误","","","B",3,"核心"],
 ["Q013","故障排查","单选","异味伴随冒烟时应？","继续试烧","加香料掩盖","立即停用并升级","开窗后继续用","C",4,"核心"],
 ["Q014","服务规范","单选","客服复述用户问题的主要作用是？","拖延时间","确认理解一致","展示专业术语","减少记录","B",3,"基础"],
 ["Q015","售后流程","单选","物流破损后最不合适的是？","保留照片","核对订单","继续通电测试","登记处理","C",4,"核心"],
 ["Q016","产品知识","判断","清洁空气炸锅加热管前必须断电并完全冷却。","正确","错误","","","A",3,"基础"],
 ["Q017","故障排查","单选","养生壶溢出首先应核对？","食材、水量和功能","用户年龄","订单备注","外箱颜色","A",3,"基础"],
 ["Q018","服务规范","判断","安抚用户等同于承诺赔偿。","正确","错误","","","B",3,"核心"],
 ["Q019","售后流程","单选","配件购买前最重要的是？","价格最低","确认型号与适配关系","颜色相近","销量最高","B",3,"基础"],
 ["Q020","安全故障","单选","发现电源线破损时应？","缠胶带继续用","停止使用并升级","换插座试试","降低水量","B",4,"核心"],
 ["Q021","产品知识","判断","所有空气炸锅首次使用都必须空烧。","正确","错误","","","B",3,"核心"],
 ["Q022","故障排查","单选","烧水噪声较大但无其他异常，可先检查？","水垢和放置情况","保修卡颜色","收货地址","客服排班","A",3,"基础"],
 ["Q023","服务规范","单选","高风险问题处理原则是？","效率优先","安全优先并及时升级","销售转化优先","避免记录","B",4,"核心"],
 ["Q024","售后流程","判断","模拟政策可当作企业真实政策向用户承诺。","正确","错误","","","B",4,"核心"],
 ["Q025","产品知识","单选","肉类烹饪建议中应强调？","外表上色即可","确保熟透","固定时间适用所有情况","无需翻面","B",3,"基础"],
 ["Q026","故障排查","判断","排查无效后应让用户无限重复同一步骤。","正确","错误","","","B",3,"核心"],
 ["Q027","服务规范","单选","结束服务前应？","确认问题与下一步","立即结束","删除记录","索要好评","A",3,"基础"],
 ["Q028","售后流程","单选","开票问题首先应核对？","购买渠道和订单","用户爱好","产品重量","客服评分","A",3,"基础"],
 ["Q029","隐私安全","单选","个人信息收集原则是？","越多越好","最小必要且走授权渠道","发送到私人账号","永久保存","B",4,"核心"],
 ["Q030","服务规范","判断","准确性不确定时，明确告知并核实比快速猜测更专业。","正确","错误","","","A",4,"核心"]
];
questions.getRange("A3:K3").values=[["题号","模块","题型","题目","选项A","选项B","选项C","选项D","答案","分值","难度"]]; header(questions.getRange("A3:K3"));
questions.getRange(`A4:K${3+qRows.length}`).values=qRows; body(questions.getRange(`A4:K${3+qRows.length}`));
questions.tables.add(`A3:K${3+qRows.length}`,true,"QuestionBankTable").style="TableStyleMedium2";
questions.freezePanes.freezeRows(3); [10,14,10,38,18,18,18,18,8,8,10].forEach((w,i)=>questions.getRangeByIndexes(0,i,3+qRows.length,1).format.columnWidth=w);

title(scores, "A1:K1", "客服月考成绩明细", "输入五个模块得分后，总分、是否及格与辅导建议自动计算");
scores.getRange("A3:K3").values=[["员工编号","姓名","产品知识(30)","故障排查(30)","售后流程(20)","服务规范(20)","总分","是否及格","薄弱模块","辅导优先级","备注"]]; header(scores.getRange("A3:K3"));
const people = [
 ["E001","陈晨",26,27,18,18],["E002","李悦",22,24,16,17],["E003","王宁",18,20,15,14],["E004","赵可",28,26,19,18],
 ["E005","周青",20,17,13,16],["E006","孙然",25,23,17,19],["E007","吴桐",17,16,14,13],["E008","郑晓",27,28,18,19],
 ["E009","冯琳",21,22,16,15],["E010","何安",24,25,17,16],["E011","唐佳",19,18,12,15],["E012","许诺",29,27,19,20]
];
scores.getRange("A4:F15").values=people;
scores.getRange("G4").formulas=[["=SUM(C4:F4)"]]; scores.getRange("G4:G15").fillDown();
scores.getRange("H4").formulas=[["=IF(G4>=80,\"及格\",\"不及格\")"]]; scores.getRange("H4:H15").fillDown();
scores.getRange("I4").formulas=[["=IF(MIN(C4/30,D4/30,E4/20,F4/20)=C4/30,\"产品知识\",IF(MIN(C4/30,D4/30,E4/20,F4/20)=D4/30,\"故障排查\",IF(MIN(C4/30,D4/30,E4/20,F4/20)=E4/20,\"售后流程\",\"服务规范\")))"]]; scores.getRange("I4:I15").fillDown();
scores.getRange("J4").formulas=[["=IF(G4<70,\"高\",IF(G4<80,\"中\",\"低\"))"]]; scores.getRange("J4:J15").fillDown();
scores.getRange("K4").formulas=[["=IF(H4=\"不及格\",\"安排专项辅导与补考\",IF(G4<85,\"巩固薄弱模块\",\"保持并参与案例分享\"))"]]; scores.getRange("K4:K15").fillDown();
body(scores.getRange("A4:K15")); scores.getRange("C4:G15").format.numberFormat="0";
scores.getRange("H4:H15").conditionalFormats.add("containsText",{text:"不及格",format:{fill:"#FDE8E8",font:{color:red,bold:true}}});
scores.getRange("J4:J15").conditionalFormats.add("containsText",{text:"高",format:{fill:"#FDE8E8",font:{color:red,bold:true}}});
scores.getRange("G4:G15").conditionalFormats.add("dataBar",{color:teal,gradient:true});
scores.tables.add("A3:K15",true,"ScoresTable").style="TableStyleMedium2"; scores.freezePanes.freezeRows(3);
[12,12,14,14,14,14,10,10,14,12,30].forEach((w,i)=>scores.getRangeByIndexes(0,i,15,1).format.columnWidth=w);

title(analysis, "A1:F1", "知识模块分析", "依据成绩明细自动识别团队薄弱项，形成下月培训重点");
analysis.getRange("A3:F3").values=[["模块","平均得分","满分","平均得分率","目标线","培训建议"]]; header(analysis.getRange("A3:F3"));
analysis.getRange("A4:A7").values=[["产品知识"],["故障排查"],["售后流程"],["服务规范"]];
analysis.getRange("B4:B7").formulas=[["=AVERAGE('成绩明细'!C4:C15)"],["=AVERAGE('成绩明细'!D4:D15)"],["=AVERAGE('成绩明细'!E4:E15)"],["=AVERAGE('成绩明细'!F4:F15)"]];
analysis.getRange("C4:C7").values=[[30],[30],[20],[20]];
analysis.getRange("D4").formulas=[["=B4/C4"]]; analysis.getRange("D4:D7").fillDown();
analysis.getRange("E4:E7").values=[[0.8],[0.8],[0.8],[0.8]];
analysis.getRange("F4").formulas=[["=IF(D4<E4,\"列为下月专项培训\",\"常规复习与案例抽查\")"]]; analysis.getRange("F4:F7").fillDown();
body(analysis.getRange("A4:F7")); analysis.getRange("B4:B7").format.numberFormat="0.0"; analysis.getRange("D4:E7").format.numberFormat="0%";
analysis.getRange("D4:D7").conditionalFormats.add("colorScale",{colors:[red,"#F4D06F",green],thresholds:["min","50%","max"]});
const moduleChart=analysis.charts.add("bar",analysis.getRange("A3:B7")); moduleChart.title="各模块平均得分"; moduleChart.hasLegend=false; moduleChart.setPosition("A10","F25");
analysis.freezePanes.freezeRows(3); [18,14,10,14,12,32].forEach((w,i)=>analysis.getRangeByIndexes(0,i,25,1).format.columnWidth=w);

title(logs, "A1:J1", "模拟用户咨询记录", "用于发现高频问题、知识缺口和需更新条目；记录均为虚构样本");
logs.getRange("A3:J3").values=[["记录ID","日期","产品类别","咨询主题","用户问题摘要","匹配知识ID","是否解决","风险等级","知识缺口","迭代建议"]]; header(logs.getRange("A3:J3"));
const logTopics=[
 ["养生壶","首次使用","新壶如何清洁试烧","KB001","是","低","否","补充首次使用图片步骤"],
 ["养生壶","异味","试烧两次仍有刺鼻气味","KB002","升级","中","否","增加异味分级判断"],
 ["养生壶","水垢","壶底白点无法擦掉","KB003","是","低","否","增加水垢与涂层异常对比"],
 ["电热水壶","自动断电","水开后开关不跳","KB007","升级","高","否","强化立即停用提示"],
 ["空气炸锅","食物不熟","鸡翅外熟内生","KB012","是","低","否","补充食材厚度变量"],
 ["通用","配件","找不到旧型号炸篮","KB017","部分","低","是","建立旧型号配件适配表"],
 ["通用","退换货","线下店购买能否线上退","KB014","升级","中","是","按渠道补充流程分支"],
 ["电热水壶","漏水","底座下方持续有水","KB009","升级","高","否","增加拍照取证要求"],
 ["空气炸锅","冒烟","炸五花肉时有白烟","KB011","是","中","否","区分油烟与异常浓烟"],
 ["通用","投诉","用户要求立即赔偿","KB019","升级","高","否","补充诉求记录模板"]
];
const logRows=[]; for(let i=0;i<30;i++){ const x=logTopics[i%logTopics.length]; logRows.push([`C${String(i+1).padStart(3,"0")}`,new Date(2026,7,1+i),...x]); }
logs.getRange("A4:J33").values=logRows; body(logs.getRange("A4:J33")); logs.getRange("B4:B33").format.numberFormat="yyyy-mm-dd";
logs.getRange("H4:H33").conditionalFormats.add("containsText",{text:"高",format:{fill:"#FDE8E8",font:{color:red,bold:true}}});
logs.getRange("I4:I33").conditionalFormats.add("containsText",{text:"是",format:{fill:"#FFF3CD",font:{color:"#8A5A00",bold:true}}});
logs.tables.add("A3:J33",true,"ConsultationLogTable").style="TableStyleMedium2"; logs.freezePanes.freezeRows(3);
[11,13,14,16,34,14,12,10,10,32].forEach((w,i)=>logs.getRangeByIndexes(0,i,33,1).format.columnWidth=w);

title(dashboard, "A1:H1", "AI赋能家电售后知识库与客服培训体系", "个人模拟项目｜数据均为虚构样本｜目标：让知识准确、易查、可训练、可迭代");
dashboard.getRange("A4:B4").values=[["核心指标","当前结果"]]; header(dashboard.getRange("A4:B4"));
dashboard.getRange("A5:A10").values=[["知识条目数"],["高风险条目数"],["模拟咨询量"],["知识缺口数"],["团队平均分"],["考试及格率"]];
dashboard.getRange("B5:B10").formulas=[
 ["=COUNTA('售后知识库'!A4:A23)"],["=COUNTIF('售后知识库'!H4:H23,\"高\")"],["=COUNTA('咨询记录'!A4:A33)"],
 ["=COUNTIF('咨询记录'!I4:I33,\"是\")"],["=AVERAGE('成绩明细'!G4:G15)"],["=COUNTIF('成绩明细'!H4:H15,\"及格\")/COUNTA('成绩明细'!A4:A15)"]
];
dashboard.getRange("A5:B10").format={fill:"#FFFFFF",font:{color:navy},borders:{insideHorizontal:{style:"thin",color:"#DCE3E8"},outside:{style:"thin",color:"#CBD5E1"}}};
dashboard.getRange("A5:A10").format.font={bold:true,color:gray}; dashboard.getRange("B5:B10").format.font={bold:true,color:teal,size:14};
dashboard.getRange("B9").format.numberFormat="0.0"; dashboard.getRange("B10").format.numberFormat="0%";
dashboard.getRange("D4:H4").merge(); dashboard.getRange("D4").values=[["项目闭环"]]; header(dashboard.getRange("D4:H4"));
dashboard.getRange("D5:H9").merge(); dashboard.getRange("D5").values=[["公开资料/模拟规则\n↓\n结构化知识库与标准话术\n↓\n新人培训与月度考试\n↓\n成绩/咨询数据分析\n↓\n专项辅导与知识库迭代"]];
dashboard.getRange("D5:H9").format={fill:pale,font:{bold:true,color:navy,size:14},horizontalAlignment:"center",verticalAlignment:"center",wrapText:true,borders:{preset:"outside",style:"thin",color:teal}};
dashboard.getRange("A13:H13").merge(); dashboard.getRange("A13").values=[["下月行动建议"]]; header(dashboard.getRange("A13:H13"));
dashboard.getRange("A14:H17").merge(); dashboard.getRange("A14").formulas=[["=\"1. 优先辅导：\"&COUNTIF('成绩明细'!J4:J15,\"高\")&\"人；2. 团队薄弱模块：\"&INDEX('模块分析'!A4:A7,MATCH(MIN('模块分析'!D4:D7),'模块分析'!D4:D7,0))&\"；3. 本期知识缺口：\"&B8&\"条；4. 高风险咨询必须执行停用与升级机制。\""]];
dashboard.getRange("A14:H17").format={fill:"#FFF8E8",font:{color:navy,size:12,bold:true},verticalAlignment:"center",wrapText:true,borders:{preset:"outside",style:"thin",color:gold}};
dashboard.getRange("A20:H20").merge(); dashboard.getRange("A20").values=[["使用说明：先维护“售后知识库”，再用“咨询记录”发现缺口，用“月考题库/成绩明细”检验培训效果，最终在本看板形成迭代决策。"]];
dashboard.getRange("A20:H20").format={fill:light,font:{color:gray,italic:true},wrapText:true}; dashboard.getRange("A20:H20").format.rowHeight=34;
[18,16,4,18,18,18,18,18].forEach((w,i)=>dashboard.getRangeByIndexes(0,i,20,1).format.columnWidth=w);
dashboard.freezePanes.freezeRows(2);

// Validations for editable governance fields.
kb.getRange("H4:H100").dataValidation={rule:{type:"list",values:["低","中","高"]}};
logs.getRange("G4:G200").dataValidation={rule:{type:"list",values:["是","部分","升级","否"]}};
logs.getRange("I4:I200").dataValidation={rule:{type:"list",values:["是","否"]}};

// Compact verification output.
const inspect = await wb.inspect({kind:"table",range:"项目看板!A1:H20",include:"values,formulas",tableMaxRows:20,tableMaxCols:8,maxChars:6000});
console.log(inspect.ndjson);
const errors = await wb.inspect({kind:"match",searchTerm:"#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",options:{useRegex:true,maxResults:100},summary:"final formula error scan"});
console.log(errors.ndjson);

for (const name of ["项目看板","售后知识库","标准话术","月考题库","成绩明细","模块分析","咨询记录"]) {
  const preview=await wb.render({sheetName:name,autoCrop:"all",scale:1,format:"png"});
  await fs.writeFile(`${outDir}/预览_${name}.png`,new Uint8Array(await preview.arrayBuffer()));
}
const output=await SpreadsheetFile.exportXlsx(wb);
await output.save(`${outDir}/AI赋能家电售后知识库与客服培训体系.xlsx`);
console.log(`EXPORTED ${outDir}/AI赋能家电售后知识库与客服培训体系.xlsx`);
