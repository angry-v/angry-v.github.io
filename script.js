function main(){

	var b_savedStatNum = 0;
	var b_adv_savedStatNum = 0;
	var p_savedStatNum = 0;
	var p_adv_savedStatNum = 0;
	let b_statArray = [];
	let b_adv_statArray = [];
	let p_statArray = [];
	let p_adv_statArray = [];
	var playerArray = [];
	var invenPlayerArray = [];
	var topPlayerArray = [];
	var teamData = new Object();
	var allGearData = new Object();
	var allSpAbilityData = new Object();
	var parser = new DOMParser();
	
	var buttons = document.getElementsByClassName("menuButton");
	buttons = Array.from(buttons);
	var results = document.getElementsByClassName("result");
	results = Array.from(results);

	function getInterval (stat) { // 41 미만 구간 0, ..., 91구간 11
		if (stat<410000) {
			return 0;
		} else if (stat >= 910000) {
			return 11;
		} else {
			return (Math.floor((stat-410000)/50000)+1);
		}
	}

	function statColor (stat) {
		if (stat < 60) {
			return "black;";
		} else if (stat < 80) {
			return "\#0072ff;";
		} else if (stat < 100) {
			return "\#ff6c00;";
		} else if (stat < 130) {
			return "\#ee0000;";
		} else if (stat < 150) {
			return "\#a900f5;";
		} else {
			return "\#a37f03;";
		}
	}

	function initTable (table) { // 테이블 초기화 함수
		var rowNum = table.getElementsByTagName("tbody")[0].rows.length;
		for(let i = 0; i<rowNum; i++){
			table.getElementsByTagName("tbody")[0].deleteRow(0);
		}
	}

	function systemText (str) { // 시스템 텍스트
		document.getElementById("systemTextContent").innerText = str;
	}

	function range (start,end) {
		var array = [];
		for (let i = start; i<end+1; i++) {
			array.push(i);
		}
		return array;
	}

	function convert(target,convertArray,defCase) {
		for (let i = 0; i<convertArray[0].length; i++) {
			if (convertArray[0][i] == target) {
				return convertArray[1][i];
			}
		}
		return defCase;
	}

	const specNameInfoEng = {
		"B":["Accr","Pwr","Beye","Runp","Stmn","Hlth","Wilp","Defp"],
		"P":["Bspd","Bpow","Bbll","Cpow","Stmn","Hlth","Wilp","Defp"]
	}

	const specNameInfoKor = {
		"B":["정확","파워","선구","주력","체력","건강","정신","수비"],
		"P":["구속","구위","변화","제구","체력","건강","정신","수비"]
	}

	const gearConvertArray = [
		["accr","pwr","beye","runp","bspd","bpow","bbll","cpow","stmn","hlth","wilp","defp"],
		["정확","파워","선구","주력","구속","구위","변화","제구","체력","건강","정신","수비"]
	]

	const posInfo = {
		"C":"포수", "1B":"1루", "2B":"2루", "3B":"3루", "SS":"유격",
		"OF":"외야", "LF":"좌익", "CF":"중견", "RF":"우익", "DH":"지명",
		"SP":"선발", "RP":"계투", "SU":"셋업", "CP":"마무리"
	}

	const gearNameInfo = {
		"B":["helmet","bat","spike"],
		"P":["cap","rosin","glove"]
	}
	const specLevelInfo = {
		"S":1,"A":2,"B":3,"C":4,"D":5
	}
	const specNextLevelInfo = {
		"B":"A","C":"B","D":"C"
	}

	const teamInfo = {
		"1":"삼성", "2":"LG", "3":"SK", "4":"Heroes", "5":"두산", "6":"롯데", "7":"한화", "8":"기아", "9":"현대",
		"10":"쌍방울", "11":"태평양", "12":"빙그레", "13":"청보", "14":"OB", "15":"MBC", "16":"삼미", "17":"해태", "18":"NC", "19":"KT"
	};

	const genInfo = {
		"-1":"-", "1":"파워", "2":"정확", "3":"선구", "4":"체력", "5":"수비", "6":"주력", "7":"정신", "8":"건강",
		"9":"구속", "10":"구위", "11":"제구", "12":"변화", "13":"체력", "14":"수비", "15":"건강", "16":"정신"
	};

	const batterSpecLevelArray = ["S","A","B","C","D"];
	const pitcherSpecLevelArray = ["S","A","B","C","D"];

	const spAbilityTypeArray = [
		{"type":"일반","color":"black;","array":range(1,40).concat(range(51,98),range(110,180),range(447,456),[1014,1016,1040],range(3467,3488))},
		{"type":"탄생","color":"red;","array":range(41,50).concat(range(99,109),range(3489,3501))},
		{"type":"전설","color":"blue;","array":range(181,240).concat(range(3434,3446))},
		{"type":"S","color":"purple;","array":range(1001,1013).concat([1015],range(1017,1039),[1041,1042,1043],range(3457,3466))},
		{"type":"L일반","color":"orange;","array":range(2001,2043).concat(range(3447,3456))},
		{"type":"L고특","color":"goldenrod;","array":range(656,683).concat(range(883,1000),range(5001,5022),range(5074,5101))},
		{"type":"F","color":"skyblue;","array":range(5023,5073)},
		{"type":"고특","color":"goldenrod;","array":range(241,446).concat(range(457,655),range(684,882),range(3000,3433),range(3502,3811))}
	];

	const birthSpAbilityInfo = {
		"41":"해결사","42":"고진감래","43":"잠수함킬러","44":"신토불이","45":"타점제조기","46":"만루사나이","47":"저격수","48":"무드남","49":"가을사나이","50":"광끼폭발",
		"99":"에이스","100":"불사신","101":"포커페이스","102":"닥터K","103":"쉬는시간","104":"연패탈출","105":"파죽지세","106":"무드남","107":"소방수","108":"레이져맨","109":"가을사나이",
		"3489":"클러치히터","3490":"슬러거","3491":"외인용병","3492":"출루머신","3493":"타격본능","3494":"불사신","3495":"불멸자","3496":"외인용병","3497":"칼날제구","3498":"클로저","3499":"변화구마스터","3500":"필승조","3501":"불멸자"
	}

	const gearSpecColorArray = ["black;","\#f0bb01;","\#f98027;","\#e90000;","\#6f4efd;","\#00929b;"];

	var addStatInfo = new Object();

	async function initialize() {
		
		systemText("실행 준비중입니다. 잠시만 기다려 주세요. (1/3)");
		for (let btn of buttons) {
			btn.disabled = true;
		}
		
		addStatInfo = await jQuery.getJSON("addStatInfo.json");

		teamData = await jQuery.getJSON('https://ya9.naver.com/gmc/getheader.nhn');
		document.getElementById('currLeagueLevel').innerText = teamData.leagueGrade.leag_grd_nm + " " + teamData.stat.leag_rnk + "위";
		var seasonNo = teamData.stat.seasn_no;
		document.getElementById('currSponsorName').innerText = (seasonNo%10 == 9 || seasonNo%10 < 4 ? "티켓링크":"벅스");
		document.getElementById('currSponsorWeek').innerText = (seasonNo+1)%5 + 1;
		systemText("실행 준비중입니다. 잠시만 기다려 주세요. (2/3)");

		allSpAbilityData = await jQuery.getJSON('https://ya9.naver.com/gmc/loadcommondata.nhn?name=abilities');
		systemText("실행 준비중입니다. 잠시만 기다려 주세요. (3/3)");
		allGearData = await jQuery.getJSON('https://ya9.naver.com/gmc/loadcommondata.nhn?name=gears');
		allGearData.helmet_set_hp.name = "H\+ 타입 헬멧"; // 스페이스가 잘못 눌려 있음..
		
		for (let btn of buttons) {
			btn.disabled = false;
		}
		systemText("실행 준비가 완료되었습니다.");
	}

	initialize();

	function addDetail(player,abl) {
		const specInfo = {
			"CONTACT":"정확", "POWER":"파워", "BALLEYE":"선구", "WILLING_B":"정신", "RUNPOWER":"주력",
			"BALLSPEED":"구속", "BALLPOWER":"구위", "CONTROL":"제구", "BREAKINGBALL":"변화",
			"DEFENCE":"수비", "STAMINA":"체력", "WILLING_P":"정신", "HEALTH":"건강"
		}

		player.fullName = player.plr_yy.slice(2,4)+player.plr_nm;
		player.star = (player.cnrn_plr_yn =="Y" ? "\u2605":""); // 관심선수 여부
		player.fullAge = (player.playing_cch_yn =="Y" ? "\u24d2":"") + player.age; // 코치여부 포함 나이

		if (player.lv == player.newLevel) { // 레벨 변화 있는경우 표시 (-는 확인 필요)
			player.fullLevel = player.lv + " (" + player.levelProgress + "\%)";
		} else if (player.lv < player.newLevel) {
			player.fullLevel = player.lv + "\+" + (player.newLevel-player.lv) + " (" + player.levelProgress + "\%)";
		} else {
			player.fullLevel = player.lv + "\-" + (player.lv-player.newLevel) + " (" + player.levelProgress + "\%)";
		}
		player.levelNum = player.newLevel * 100 + player.levelProgress;
		player.specName = (player.grth_tp_cd != null ? specInfo[player.grth_tp_cd.slice(0,player.grth_tp_cd.length-2)]:"");
		player.specLevel = (player.grth_tp_cd != null ? player.grth_tp_cd[player.grth_tp_cd.length-1]:"");
		player.spAbilityArray = (player.ptcry_ablty_no_cont ? player.ptcry_ablty_no_cont.split("|"):[]);

		player.birthSpAbility = (player.spAbilityArray.filter(ablNo => spAbilityTypeArray[1].array.includes(Number(ablNo))).length) ? player.spAbilityArray.filter(ablNo => spAbilityTypeArray[1].array.includes(Number(ablNo)))[0] : 0;

		for (let gear of gearNameInfo[player.batr_pitr_tp_cd]) {
			player[gear+"_spec"] = (player[gear+"_id"] != null ? getGearSpec(player[gear+"_id"],allGearData,player):[]);
		}

		if (player.plr_grd_tp_cd == "S" || player.plr_grd_tp_cd == null) {
			player.plr_grd_tp_cd = "";
		}

		if (abl) {
			player.ablty_full = [];
			for (spec of specNameInfoEng[player.batr_pitr_tp_cd]) {
				var fullStat = player.ablty_add[spec.toLowerCase()] + (player["gear_"+spec.toLowerCase()]?player["gear_"+spec.toLowerCase()]:0) + (player.set_ablty?player.set_ablty:0);
				player.ablty_full.push(fullStat);
			}
		}

		return player;
	}

	const tabArray = [ // 반드시 탭 순서대로 넣을 것
		document.getElementById("home"),
		document.getElementById("searchPlayers"),
		document.getElementById("managePlayers"),
		document.getElementById("batterGrowthCalc"),
		document.getElementById("pitcherGrowthCalc"),
		document.getElementById("lineup")
	]

	for(i = 0; i<buttons.length; i++){ // 각 버튼 설정
		buttons[i].onclick = function(){
			for (let button of buttons){
				button.classList.toggle('on',false);
			}
			for (let result of results) {
				result.classList.toggle('on',false);
			}
			this.classList.toggle('on',true);
			idx = buttons.indexOf(this);
			tabArray[idx].classList.toggle('on',true);
			switch(this.id){
				case "homeBtn": // 홈
					break;
				case "searchBtn": // 선수검색
					break;
				case "manageBtn":
					break;
				case "batterBtn": // 타자육성
					b_calculateStat([],false);
					break;
				case "pitcherBtn": // 투수육성
					p_calculateStat([],false);
					break;
				case "lineupBtn": // 기타
					showPlayers();
					break;
			}
			systemText("");
		}
	}

	// 선수 불러오기 시작

	document.getElementById("myPlayerFetchBtn").onclick = async function() { // 보유선수 불러오기

		const acqsConvertInfo = {
			"SC":"스카우트", "FA":"FA거래소", "EV":"이벤트", "TM":"올드선수", "DR":"드래프트", "AT":"출석보상", "ST":"창단선수",
			"CH":"챌린지모드", "LW":"우승보상", "LI":"리미티드"
		}

		const actionInfo = {
			"F":"퓨쳐스", "P":"특훈", "S":"유학", "R":"휴양", "M":"FA등록", "Z":"슬럼프"
		}

		systemText("선수 검색 중입니다.");

		var allPlayerData = await jQuery.getJSON('https://ya9.naver.com/gmc/teamallplayers.nhn');
		playerArray = allPlayerData.batters.concat(allPlayerData.pitchers);
		for (let player of playerArray){ // 선수 목록 정리
			player = addDetail(player,false);
		}

		var myBatterTable = document.getElementById("myBatterTable");
		var myPitcherTable = document.getElementById("myPitcherTable");
		var targetPlayerName = document.getElementById("targetMyPlayerName").value;
		var targetPlayerYear = targetPlayerName.replace(/[^0-9]/g,"");
		targetPlayerName = targetPlayerName.replace(/[0-9]|\s/g,"");
		initTable(myBatterTable);
		initTable(myPitcherTable);


		for (let player of playerArray){ // 보유선수 띄우기

			if (player.plr_nm.match(targetPlayerName) && player.plr_yy.match(targetPlayerYear)) {
				var tdArray = [
					{"text":player.fullName,"style":"cursor:pointer;","class":"getMyPlayer","value":player.plr_no}, // 이름
					{"text":(player.birthSpAbility ? birthSpAbilityInfo[player.birthSpAbility] : "")}, // 탄생특
					{"text":player.star}, // 관심
					{"text":player.fullLevel, "value":player.levelNum}, // 레벨
					{"text":player.fullAge}, // 나이
					{"text":genInfo[player.gen_trng_no]}, // 일훈
					{"text":player.expr_lv}, // 경전레벨
					{"text":player.brk_limt_lv}, // 한계돌파
					{"text":acqsConvertInfo[player.acqs_tp_cd]} // 획득경로
				]
				var newRow = makeRow(tdArray);
				var releaseButton = document.createElement("button");
				releaseButton.setAttribute("style", "width: 40px; height: 20px; font-size: small;");
				releaseButton.innerText = "방출";
				releaseButton.classList.add("normalButton");
				releaseButton.classList.add("playerReleaseButton");
				releaseButton.value = playerArray.indexOf(player);
				releaseButton.id = "playerRelease_" + player.plr_no;
				var td = document.createElement("td");
				if(!player.actn_tp_cd && player.plr_ord_cd == 91 && player.cnrn_plr_yn != "Y") {
					td.appendChild(releaseButton);
				} else if (player.plr_ord_cd < 91) {
					td.innerText = "1군";
				} else if (player.actn_tp_cd) {
					td.innerText = actionInfo[player.actn_tp_cd];
				} else {
					td.innerText = "관심";
				}
				newRow.appendChild(td);

				var display = function (player) {
					if (document.getElementById('starOnly').checked && player.cnrn_plr_yn != "Y") {
						return false;
					}
					if (player.lv < document.getElementById('myMinLevel').value || player.lv > document.getElementById('myMaxLevel').value) {
						return false;
					}
					if (player.age < document.getElementById('myMinAge').value || player.age > document.getElementById('myMaxAge').value) {
						return false;
					}
					return true;
				}

				if (display(player)) {
					if (player.batr_pitr_tp_cd == "B") {
						myBatterTable.children[1].appendChild(newRow);
					} else {
						myPitcherTable.children[1].appendChild(newRow);
					}
				}
			}
		}

		systemText("선수 검색이 완료되었습니다.");

		// 정렬기능

		function compareRows(r1,r2,index,type,order) { // order: 1 inc -1 dec
			var a = r1.children[index].innerText;
			var b = r2.children[index].innerText;
			switch(type) {
				case "number":
					return (a-b)*order;
				case "name":
					return (a.replace(/[0-9]/g,'')>b.replace(/[0-9]/g,'') ? 1:(a.replace(/[0-9]/g,'')==b.replace(/[0-9]/g,'') ? 0:-1))*order;
				case "level":
					a = r1.children[index].value;
					b = r2.children[index].value;
					return (a-b)*order;
				case "age":
					a = Number(a.replace(/[^0-9]/g,'')) + (a.match("\u24d2") ? 100:0);
					b = Number(b.replace(/[^0-9]/g,'')) + (b.match("\u24d2") ? 100:0);
					return (a-b)*order;
				default:
					return (a>b ? 1:(a==b ? 0:-1))*order;
			}
		}

		function sortRows (table,index,type,order) {
			var body = table.getElementsByTagName('tbody')[0];
			var rows = Array.from(body.getElementsByTagName('tr'));
			rows.sort((a,b) => compareRows(a,b,index,type,order));
			body.innerHTML = '';
			for (row of rows) {
				body.appendChild(row);
			}
		}

		var batterIncButtons = Array.from(document.getElementsByClassName("sort b_inc"));
		var batterDecButtons = Array.from(document.getElementsByClassName("sort b_dec"));
		var pitcherIncButtons = Array.from(document.getElementsByClassName("sort p_inc"));
		var pitcherDecButtons = Array.from(document.getElementsByClassName("sort p_dec"));
		for (let btn of batterIncButtons) {
			btn.onclick = function(){
				sortRows(document.getElementById('myBatterTable'),batterIncButtons.indexOf(this),this.getAttribute('data-value'),1);
			}
		}
		for (let btn of batterDecButtons) {
			btn.onclick = function() {
				sortRows(document.getElementById('myBatterTable'),batterDecButtons.indexOf(this),this.getAttribute('data-value'),-1);
			}
		}
		for (let btn of pitcherIncButtons) {
			btn.onclick = function(){
				sortRows(document.getElementById('myPitcherTable'),pitcherIncButtons.indexOf(this),this.getAttribute('data-value'),1);
			}
		}
		for (let btn of pitcherDecButtons) {
			btn.onclick = function() {
				sortRows(document.getElementById('myPitcherTable'),pitcherDecButtons.indexOf(this),this.getAttribute('data-value'),-1);
			}
		}

		for (let player of document.getElementsByClassName("getMyPlayer")) { // 육성탭으로 전환
			player.onclick = async function() {
				await getPlayerInfo(player.value);

				document.getElementById("searchBtn").classList.toggle('on',false);
				document.getElementById("manageBtn").classList.toggle('on',true);
				document.getElementById("searchPlayers").classList.toggle('on',false);
				document.getElementById("managePlayers").classList.toggle('on',true);
				document.getElementById("noPlayerMessage").classList.toggle('hide',true);
				document.getElementById("playerDetail").classList.toggle('hide',false);
			}
		}

		var playerReleaseButtons = Array.from(document.getElementsByClassName("playerReleaseButton"));

		for(let btn of playerReleaseButtons){ // 방출하기
			btn.onclick = async function(){
				var player = playerArray[this.value];
				var con = confirm("취소할 수 없습니다. " + player.fullName + " 선수를 방출하시겠습니까?");
				if (con) {
					var result = await jQuery.getJSON('https://ya9.naver.com/gmc/release.nhn?no='+player.plr_no);
					alert(player.fullName + " 선수의 방출에 " + (result.success?"성공":"실패") + "하였습니다.");
				}
			}
		}
	}
	
	document.getElementById("invenPlayerFetchBtn").onclick = async function() { // 일반선수 불러오기

		systemText("선수 검색 중입니다.");

		var allBatterTable = document.getElementById("allBatterTable");
		var allPitcherTable = document.getElementById("allPitcherTable");
		var targetPlayerName = document.getElementById("targetInvenPlayerName").value;
		var targetPlayerYear = targetPlayerName.replace(/[^0-9]/g,"");
		targetPlayerName = targetPlayerName.replace(/[0-9]|\s/g,"");
		initTable(allBatterTable);
		initTable(allPitcherTable);

		invenPlayerArray.length = 0;

		invenPlayerArray = await getInvenPlayers(targetPlayerYear,targetPlayerName);
		
		for (let i in invenPlayerArray[0].results){ // 일반선수 띄우기 (타자)
			var invenPlayer = invenPlayerArray[0].results[i];
			var tdArray = [
				{"text":String(invenPlayer.plr_yy).slice(2,4)+invenPlayer.plr_nm,"style":"cursor:pointer;","class":"getInvenBatter","value":invenPlayer.inven_plr_no}, // 이름
				{"text":invenPlayer.age}, // 나이
				{"text":teamInfo[invenPlayer.mteam_no]}, // 소속
				{"text":invenPlayer.lv}, // 레벨
				{"text":posInfo[invenPlayer.main_pos_cd]}, // 포지션
				{"text":(invenPlayer.hit_ptch_drctn_cd[1]=='R'?'우타':(invenPlayer.hit_ptch_drctn_cd[1]=='L'?'좌타':'양타'))}, // 타격유형
				{"text":Math.floor(invenPlayer.batr_accr)}, // 정확
				{"text":Math.floor(invenPlayer.batr_pwr)}, // 파워
				{"text":Math.floor(invenPlayer.batr_beye)}, // 선구
				{"text":Math.floor(invenPlayer.batr_runp)}, // 주력
				{"text":Math.floor(invenPlayer.batr_stmn)}, // 체력
				{"text":Math.floor(invenPlayer.batr_hlth)}, // 건강
				{"text":Math.floor(invenPlayer.batr_wilp)}, // 정신
				{"text":Math.floor(invenPlayer.batr_defp)} // 수비
			]
			var newRow = makeRow(tdArray);
			var display = function (player) {
				if (player.lv < document.getElementById('invenMinLevel').value || player.lv > document.getElementById('invenMaxLevel').value) {
					return false;
				}
				if (player.age < document.getElementById('invenMinAge').value || player.age > document.getElementById('invenMaxAge').value) {
					return false;
				}
				return true;
			}
			if (display(invenPlayer)) {
				allBatterTable.children[1].appendChild(newRow); // 새 행 추가
			}
		}
		for (let i in invenPlayerArray[1].results){ // 일반선수 띄우기 (투수)
			var invenPlayer = invenPlayerArray[1].results[i];
			var tdArray = [
				{"text":String(invenPlayer.plr_yy).slice(2,4)+invenPlayer.plr_nm,"style":"cursor:pointer;","class":"getInvenPitcher","value":invenPlayer.inven_plr_no}, // 이름
				{"text":invenPlayer.age}, // 나이
				{"text":teamInfo[invenPlayer.mteam_no]}, // 소속
				{"text":invenPlayer.lv}, // 레벨
				{"text":posInfo[invenPlayer.main_pos_cd]}, // 보직
				{"text":(invenPlayer.hit_ptch_drctn_cd[0]=='R'?'우투':(invenPlayer.hit_ptch_drctn_cd[0]=='L'?'좌투':'양투'))}, // 투구유형
				{"text":Math.floor(invenPlayer.pitr_bspd)}, // 구속
				{"text":Math.floor(invenPlayer.pitr_bpow)}, // 구위
				{"text":Math.floor(invenPlayer.pitr_bbll)}, // 변화
				{"text":Math.floor(invenPlayer.pitr_cpow)}, // 제구
				{"text":Math.floor(invenPlayer.pitr_stmn)}, // 체력
				{"text":Math.floor(invenPlayer.pitr_hlth)}, // 건강
				{"text":Math.floor(invenPlayer.pitr_wilp)}, // 정신
				{"text":Math.floor(invenPlayer.pitr_defp)} // 수비
			]
			var newRow = makeRow(tdArray);
			var display = function (player) {
				if (player.lv < document.getElementById('invenMinLevel').value || player.lv > document.getElementById('invenMaxLevel').value) {
					return false;
				}
				if (player.age < document.getElementById('invenMinAge').value || player.age > document.getElementById('invenMaxAge').value) {
					return false;
				}
				return true;
			}
			if (display(invenPlayer)) {
				allPitcherTable.children[1].appendChild(newRow); // 새 행 추가
			}
		}

		systemText("선수 검색이 완료되었습니다.");

		var invenBatters = Array.from(document.getElementsByClassName('getInvenBatter'));
		var invenPitchers = Array.from(document.getElementsByClassName('getInvenPitcher'));

		for (let invenBatter of invenBatters) {
			invenBatter.onclick = async function() {
				var num = invenBatters.indexOf(this);
				systemText("선수 정보를 불러오는 중입니다.");
				var abilityArray = [
					invenPlayerArray[0].results[num].batr_accr*10000,
					invenPlayerArray[0].results[num].batr_pwr*10000,
					invenPlayerArray[0].results[num].batr_beye*10000,
					invenPlayerArray[0].results[num].batr_runp*10000,
					invenPlayerArray[0].results[num].batr_stmn*10000,
					invenPlayerArray[0].results[num].batr_hlth*10000,
					invenPlayerArray[0].results[num].batr_wilp*10000,
					invenPlayerArray[0].results[num].batr_defp*10000
				];

				document.getElementById("searchBtn").classList.toggle('on',false);
				document.getElementById("batterBtn").classList.toggle('on',true);
				document.getElementById("searchPlayers").classList.toggle('on',false);
				document.getElementById("batterGrowthCalc").classList.toggle('on',true);
				document.getElementById("basicBatterGrowth").classList.toggle('on',true);
				document.getElementById("basicBatterGrowthBtn").classList.toggle('on',true);
				document.getElementById("detailBatterGrowth").classList.toggle('on',false);
				document.getElementById("detailBatterGrowthBtn").classList.toggle('on',false); // 타자육성 탭으로 전환

				systemText("선수 정보 불러오기가 완료되었습니다.");
				b_calculateStat(abilityArray,invenPlayerArray[0].results[num].age,true);
			}
		}

		for(let invenPitcher of invenPitchers){ // 육성 탭으로 전환 (일반선수 투수)
			invenPitcher.onclick = async function(){
				var num = invenPitchers.indexOf(this);

				systemText("선수 정보를 불러오는 중입니다.");
				var abilityArray = [
					invenPlayerArray[1].results[num].pitr_bspd*10000,
					invenPlayerArray[1].results[num].pitr_bpow*10000,
					invenPlayerArray[1].results[num].pitr_bbll*10000,
					invenPlayerArray[1].results[num].pitr_cpow*10000,
					invenPlayerArray[1].results[num].pitr_stmn*10000,
					invenPlayerArray[1].results[num].pitr_hlth*10000,
					invenPlayerArray[1].results[num].pitr_wilp*10000,
					invenPlayerArray[1].results[num].pitr_defp*10000
				];

				document.getElementById("searchBtn").classList.toggle('on',false);
				document.getElementById("pitcherBtn").classList.toggle('on',true);
				document.getElementById("searchPlayers").classList.toggle('on',false);
				document.getElementById("pitcherGrowthCalc").classList.toggle('on',true);
				document.getElementById("basicPitcherGrowth").classList.toggle('on',true);
				document.getElementById("basicPitcherGrowthBtn").classList.toggle('on',true);
				document.getElementById("detailPitcherGrowth").classList.toggle('on',false);
				document.getElementById("detailPitcherGrowthBtn").classList.toggle('on',false); // 투수육성 탭으로 전환

				systemText("선수 정보 불러오기가 완료되었습니다.");
				p_calculateStat(abilityArray,invenPlayerArray[1].results[num].age,true);
			}
		}
			
	}

	document.getElementById("topPlayerFetchBtn").onclick = async function() { // T선수 불러오기

		systemText("선수 검색 중입니다.");

		var topBatterTable = document.getElementById("topBatterTable");
		var topPitcherTable = document.getElementById("topPitcherTable");
		var targetPlayerName = document.getElementById("targetTopPlayerName").value.replace("T","");
		var targetPlayerYear = targetPlayerName.replace(/[^0-9]/g,"");
		targetPlayerName = targetPlayerName.replace(/[0-9]|\s/g,"");
		initTable(topBatterTable);
		initTable(topPitcherTable);

		topPlayerArray = await jQuery.getJSON("topPlayer.json");

		const lrInfo = {"BL":"좌타", "BR":"우타", "BS":"양타", "PL":"좌투", "PR":"우투", "PU":"언"};
		
		for (let topPlayer of topPlayerArray){ // T선수 띄우기 (타자)

			var display = function (player) {
				var years = Array.from(document.getElementsByName('topYear'));
				var teams = Array.from(document.getElementsByName('topTeam'));
				var battings = Array.from(document.getElementsByName('topBatting'));
				var pitchings = Array.from(document.getElementsByName('topPitching'));
				if (!years.filter(year => year.value == player.week.slice(0,2))[0].checked) {
					return false;
				}
				if (!teams.filter(team => teamInfo[team.value] == player.team)[0].checked) {
					return false;
				}
				if (player.bp == "B") {
					if (!battings.filter(bat => player.lr.match(lrInfo[bat.value]))[0].checked) {
						return false;
					}
				} else {
					if (!pitchings.filter(pit => player.lr.match(lrInfo[pit.value]))[0].checked) {
						return false;
					}
				}
				if (player.age < document.getElementById('topMinAge').value || player.age > document.getElementById('topMaxAge').value) {
					return false;
				}
				return true;
			}

			if (topPlayer.name.match(targetPlayerName) && topPlayer.week.slice(0,2).match(targetPlayerYear) && display(topPlayer)) {
				var tdArray = [
					{"text":topPlayer.week}, // 주차
					{"text":topPlayer.week.slice(0,2) + topPlayer.name + "T","style":"cursor:pointer;","class":(topPlayer.bp == "B" ? "getTopBatter":"getTopPitcher"),"value":topPlayer.no}, // 이름
					{"text":topPlayer.age}, // 나이
					{"text":topPlayer.team}, // 소속
					{"text":topPlayer.lv}, // 레벨
					{"text":topPlayer.pos}, // 포지션
					{"text":topPlayer.lr.slice((topPlayer.bp == "B" ? 2:0),(topPlayer.bp == "B" ? 4:2))}, // 투타유형
					{"text":Math.floor(topPlayer[(topPlayer.bp == "B" ? "batr_accr":"pitr_bspd")])}, // 정확/구속
					{"text":Math.floor(topPlayer[(topPlayer.bp == "B" ? "batr_pwr":"pitr_bpow")])}, // 파워/구위
					{"text":Math.floor(topPlayer[(topPlayer.bp == "B" ? "batr_beye":"pitr_bbll")])}, // 선구/변화
					{"text":Math.floor(topPlayer[(topPlayer.bp == "B" ? "batr_runp":"pitr_cpow")])}, // 주력/제구
					{"text":Math.floor(topPlayer[(topPlayer.bp == "B" ? "batr":"pitr") + "_stmn"])}, // 체력
					{"text":Math.floor(topPlayer[(topPlayer.bp == "B" ? "batr":"pitr") + "_hlth"])}, // 건강
					{"text":Math.floor(topPlayer[(topPlayer.bp == "B" ? "batr":"pitr") + "_wilp"])}, // 정신
					{"text":Math.floor(topPlayer[(topPlayer.bp == "B" ? "batr":"pitr") + "_defp"])} // 수비
				]
				var newRow = makeRow(tdArray);
				if (topPlayer.bp == "B") {
					topBatterTable.children[1].appendChild(newRow);
				} else {
					topPitcherTable.children[1].appendChild(newRow);
				}
			}
		}

		systemText("선수 검색이 완료되었습니다.");

		var topBatters = Array.from(document.getElementsByClassName('getTopBatter'));
		var topPitchers = Array.from(document.getElementsByClassName('getTopPitcher'));

		for (let topBatter of topBatters) { // 육성 탭으로 전환 (T선수 타자)
			topBatter.onclick = async function() {
				systemText("선수 정보를 불러오는 중입니다.");
				var no = this.value;
				var thisTopPlayer = topPlayerArray.filter(obj => obj.no == no)[0]

				var abilityArray = [
					thisTopPlayer.batr_accr * 10000,
					thisTopPlayer.batr_pwr * 10000,
					thisTopPlayer.batr_beye * 10000,
					thisTopPlayer.batr_runp * 10000,
					thisTopPlayer.batr_stmn * 10000,
					thisTopPlayer.batr_hlth * 10000,
					thisTopPlayer.batr_wilp * 10000,
					thisTopPlayer.batr_defp * 10000
				];

				document.getElementById("searchBtn").classList.toggle('on',false);
				document.getElementById("batterBtn").classList.toggle('on',true);
				document.getElementById("searchPlayers").classList.toggle('on',false);
				document.getElementById("batterGrowthCalc").classList.toggle('on',true);
				document.getElementById("basicBatterGrowth").classList.toggle('on',true);
				document.getElementById("basicBatterGrowthBtn").classList.toggle('on',true);
				document.getElementById("detailBatterGrowth").classList.toggle('on',false);
				document.getElementById("detailBatterGrowthBtn").classList.toggle('on',false); // 타자육성 탭으로 전환

				systemText("선수 정보 불러오기가 완료되었습니다.");
				b_calculateStat(abilityArray,thisTopPlayer.age,true);
			}
		}

		for(let topPitcher of topPitchers){ // 육성 탭으로 전환 (T선수 투수)
			topPitcher.onclick = async function(){
				systemText("선수 정보를 불러오는 중입니다.");
				var no = this.value;
				var thisTopPlayer = topPlayerArray.filter(obj => obj.no == no)[0]

				var abilityArray = [
					thisTopPlayer.pitr_bspd * 10000,
					thisTopPlayer.pitr_bpow * 10000,
					thisTopPlayer.pitr_bbll * 10000,
					thisTopPlayer.pitr_cpow * 10000,
					thisTopPlayer.pitr_stmn * 10000,
					thisTopPlayer.pitr_hlth * 10000,
					thisTopPlayer.pitr_wilp * 10000,
					thisTopPlayer.pitr_defp * 10000
				];

				document.getElementById("searchBtn").classList.toggle('on',false);
				document.getElementById("pitcherBtn").classList.toggle('on',true);
				document.getElementById("searchPlayers").classList.toggle('on',false);
				document.getElementById("pitcherGrowthCalc").classList.toggle('on',true);
				document.getElementById("basicPitcherGrowth").classList.toggle('on',true);
				document.getElementById("basicPitcherGrowthBtn").classList.toggle('on',true);
				document.getElementById("detailPitcherGrowth").classList.toggle('on',false);
				document.getElementById("detailPitcherGrowthBtn").classList.toggle('on',false); // 투수육성 탭으로 전환

				systemText("선수 정보 불러오기가 완료되었습니다.");
				p_calculateStat(abilityArray,thisTopPlayer.age,true);
			}
		}
			
	}

	function makeRow(cellArray) { // 선수 띄울 때 쓰는 함수
		var row = document.createElement("tr");
		for (let i=0 ; i<cellArray.length; i++) {
			var td = document.createElement("td");
			td.innerText = cellArray[i].text;
			if("style" in cellArray[i]) {
				td.setAttribute('style',cellArray[i].style);
			}
			if ("class" in cellArray[i]) {
				td.classList.add(cellArray[i].class);
			}
			if ("value" in cellArray[i]) {
				td.value = cellArray[i].value;
			}
			row.appendChild(td);
		}
		return row;
	}

	async function getInvenPlayers(year,name) { // 일반선수 불러오기
		var tempInvenPlayerArray = [];
		if (year =="") {
			year = "0000"
		} else {
			year = (Number(year)>81 ? "19":"20") + year;
		}

		for (let bp of ["B","P"]) {
			var queryString = "wt=json&q=batr_pitr_tp_cd:" + bp + " AND plr_yy:[" + (year =="0000" ? 1982:year) + " TO " + (year =="0000" ? 2020:year) + "] AND plr_nm_like:" + name + "&sort=plr_nm asc&start=0&rows=200";
			queryString = escape(queryString);
			var array = await jQuery.getJSON('https://ya9.naver.com/gmc/searchinvenplayer.nhn',{querystring:queryString});
			tempInvenPlayerArray = tempInvenPlayerArray.concat(array);
		}

		return tempInvenPlayerArray;
	}

	document.getElementById('myPlayerSearchBtn').onclick = function() {
		document.getElementById('myPlayerSearchBtn').classList.toggle('on',true);
		document.getElementById('searchMyPlayers').classList.toggle('on',true);
		document.getElementById('invenPlayerSearchBtn').classList.toggle('on',false);
		document.getElementById('searchInvenPlayers').classList.toggle('on',false);
		document.getElementById('topPlayerSearchBtn').classList.toggle('on',false);
		document.getElementById('searchTopPlayers').classList.toggle('on',false);
	}

	document.getElementById('invenPlayerSearchBtn').onclick = function() {
		document.getElementById('myPlayerSearchBtn').classList.toggle('on',false);
		document.getElementById('searchMyPlayers').classList.toggle('on',false);
		document.getElementById('invenPlayerSearchBtn').classList.toggle('on',true);
		document.getElementById('searchInvenPlayers').classList.toggle('on',true);
		document.getElementById('topPlayerSearchBtn').classList.toggle('on',false);
		document.getElementById('searchTopPlayers').classList.toggle('on',false);
	}

	document.getElementById('topPlayerSearchBtn').onclick = function() {
		document.getElementById('myPlayerSearchBtn').classList.toggle('on',false);
		document.getElementById('searchMyPlayers').classList.toggle('on',false);
		document.getElementById('invenPlayerSearchBtn').classList.toggle('on',false);
		document.getElementById('searchInvenPlayers').classList.toggle('on',false);
		document.getElementById('topPlayerSearchBtn').classList.toggle('on',true);
		document.getElementById('searchTopPlayers').classList.toggle('on',true);
	}

	// 선수 불러오기 끝

	// 선수 관리 시작

	document.getElementById('playerStatInfoBtn').onclick = function() {
		document.getElementById('playerStatInfoBtn').classList.toggle('on',true);
		document.getElementById('playerStatInfo').classList.toggle('on',true);
		document.getElementById('playerSpAbilityInfoBtn').classList.toggle('on',false);
		document.getElementById('playerSpAbilityInfo').classList.toggle('on',false);
		document.getElementById('playerTrainingBtn').classList.toggle('on',false);
		document.getElementById('playerTraining').classList.toggle('on',false);
	}

	document.getElementById('playerSpAbilityInfoBtn').onclick = function() {
		document.getElementById('playerStatInfoBtn').classList.toggle('on',false);
		document.getElementById('playerStatInfo').classList.toggle('on',false);
		document.getElementById('playerSpAbilityInfoBtn').classList.toggle('on',true);
		document.getElementById('playerSpAbilityInfo').classList.toggle('on',true);
		document.getElementById('playerTrainingBtn').classList.toggle('on',false);
		document.getElementById('playerTraining').classList.toggle('on',false);
	}

	
	document.getElementById('playerTrainingBtn').onclick = function() {
		document.getElementById('playerStatInfoBtn').classList.toggle('on',false);
		document.getElementById('playerStatInfo').classList.toggle('on',false);
		document.getElementById('playerSpAbilityInfoBtn').classList.toggle('on',false);
		document.getElementById('playerSpAbilityInfo').classList.toggle('on',false);
		document.getElementById('playerTrainingBtn').classList.toggle('on',true);
		document.getElementById('playerTraining').classList.toggle('on',true);
	}

	async function getPlayerInfo(playerNo) { // 선수관리 불러오기

		systemText("선수 정보를 불러오는 중입니다.");

		var newPlayer = await jQuery.getJSON('https://ya9.naver.com/gmc/playerstatboxdata.nhn?no=' + playerNo);
		player = addDetail(newPlayer,true);
		var cpData = await jQuery.getJSON('https://ya9.naver.com/gmc/getcash.nhn');
		document.getElementById("maxCP").value = Math.floor(cpData.cp/10000);

		document.getElementById("playerPic").src = "https://images.ya9.toastoven.net/baseball/ko/img_g/data/player/" + player.plr_img_nm;
		document.getElementById("playerBreakLimitPic").src = "/images/breakLimit_" + player.brk_limt_lv + ".png";
		document.getElementById("playerGradePic").src = "/images/grade_" + player.plr_grd_tp_cd + ".png";
		document.getElementById("playerName").innerText = player.fullName;
		document.getElementById("playerLevel").innerText = player.fullLevel;
		document.getElementById("playerAge").innerText = player.fullAge;
		document.getElementById("playerNo").innerText = player.plr_no;
		document.getElementById("playerPos").innerText = posInfo[player.main_pos_cd];
		document.getElementById("playerExpLevel").innerText = player.expr_lv;
		document.getElementById("playerExpStar").innerText = "";
		for (let i=0; i<5; i++) {
			document.getElementById("playerExpStar").innerText += i<player.expr_lv?"\u2605":"\u2606";
		}
		document.getElementById("playerGen").innerText = genInfo[player.gen_trng_no];
		document.getElementById("newGenType").innerHTML = "";
		document.getElementById("changeGenBtn").disabled = (player.playing_cch_yn == "Y");

		if (player.batr_pitr_tp_cd == "P") {
			for (let i = 9; i<17; i++) {
				document.getElementById("newGenType").innerHTML += "<option value='" + i + "'>"+genInfo[i]+"</option>";
			}
			document.getElementById("statName0").innerText = "구속:";
			document.getElementById("statName1").innerText = "구위:";
			document.getElementById("statName2").innerText = "변화:";
			document.getElementById("statName3").innerText = "제구:";
			document.getElementById("statNameFull0").innerText = "구속:";
			document.getElementById("statNameFull1").innerText = "구위:";
			document.getElementById("statNameFull2").innerText = "변화:";
			document.getElementById("statNameFull3").innerText = "제구:";
			document.getElementById("targetSpecName").innerHTML = "<option selected>구속</option><option>구위</option><option>변화</option><option>제구</option><option>체력</option><option>정신</option>";
		} else {
			for (let i = 1; i<9; i++) {
				document.getElementById("newGenType").innerHTML += "<option value='" + i + "'>"+genInfo[i]+"</option>";
			}
			document.getElementById("statName0").innerText = "정확:";
			document.getElementById("statName1").innerText = "파워:";
			document.getElementById("statName2").innerText = "선구:";
			document.getElementById("statName3").innerText = "주력:";
			document.getElementById("statNameFull0").innerText = "정확:";
			document.getElementById("statNameFull1").innerText = "파워:";
			document.getElementById("statNameFull2").innerText = "선구:";
			document.getElementById("statNameFull3").innerText = "주력:";
			document.getElementById("targetSpecName").innerHTML = "<option selected>정확</option><option>파워</option><option>선구</option><option>주력</option><option>정신</option><option>수비</option>";
		}

		var abilityArray = [];

		for (let i=0; i<8; i++) { // 능력치
			var ability = player.ablty['dobl'+specNameInfoEng[player.batr_pitr_tp_cd][i]];
			document.getElementById("stat"+i).innerText = (Math.floor((Math.round(ability*1000)/10))/100).toFixed(2);
			document.getElementById("stat"+i).setAttribute("style","color: " + statColor(parseInt(ability)));
			abilityArray.push(ability*10000);
			var fullAbility = player.ablty_add['dobl'+specNameInfoEng[player.batr_pitr_tp_cd][i]] + (player["gear_"+specNameInfoEng[player.batr_pitr_tp_cd][i].toLowerCase()]>0?player["gear_"+specNameInfoEng[player.batr_pitr_tp_cd][i].toLowerCase()]:0) + (player["set_ablty"]>0?player["set_ablty"]:0);
			document.getElementById("statFull"+i).innerText = (Math.floor((Math.round(fullAbility*1000)/10))/100).toFixed(2);
			document.getElementById("statFull"+i).setAttribute("style","color: " + statColor(parseInt(fullAbility)));
		}

		for (let i=0; i<10; i++) { // 특능 리스트 초기화
			document.getElementById("spAbility"+i).innerHTML = "&nbsp;";
			document.getElementById("spAbility"+i+"_name").innerHTML = "&nbsp;";
			document.getElementById("spAbility"+i+"_detail").innerHTML = "&nbsp;";
			document.getElementById("spAbility"+i).setAttribute("style","color: black;"); // 기본값
		}

		document.getElementById("spAbilityCount").innerText = player.spAbilityArray.length;
		for (let i=0; i<player.spAbilityArray.length; i++) {
			document.getElementById("spAbility"+i).innerText = allSpAbilityData[player.spAbilityArray[i]].ptcry_ablty_nm;
			document.getElementById("spAbility"+i+"_name").innerText = allSpAbilityData[player.spAbilityArray[i]].ptcry_ablty_nm;
			document.getElementById("spAbility"+i+"_detail").innerText = allSpAbilityData[player.spAbilityArray[i]].faclt_cmnt;
			document.getElementById("spAbility"+i).setAttribute('style',"cursor: pointer; color: " + spAbilityTypeArray.filter(obj => obj.array.includes(allSpAbilityData[player.spAbilityArray[i]].ptcry_ablty_no))[0].color);
			document.getElementById("spAbility"+i).onclick = async function() {
				var con = confirm("취소할 수 없습니다. " + allSpAbilityData[player.spAbilityArray[i]].ptcry_ablty_nm + " 특수능력을 삭제하시겠습니까?");
				if (con) {
					deleteSpAbility(player,player.spAbilityArray[i]);
				}
			}
		}

		document.getElementById("playerExp").innerText = player.expr_lv;

		if (player.playing_cch_yn == "Y") {
			document.getElementById("playerSpec").innerText = "코치";
			document.getElementById("playerSpecLite").innerText = "-";
		} else {
			if (player.boosterUse) {
				player.specLevel += "(S)";
			}
			document.getElementById("playerSpec").innerText = player.specName + " " + player.specLevel;
			document.getElementById("playerSpecLite").innerText = player.specName + " " + player.specLevel;
		}

		for (let i=0; i<3; i++) { // 장비 초기화
			document.getElementById("gear"+i).innerText = "없음";
			document.getElementById("gearLite"+i).innerText = "없음";
			document.getElementById("gearLite"+i).setAttribute('style','font-size: ');
			document.getElementById("gear"+i+"_target").innerHTML = "<option>랜덤</option>";
			for (let j=0; j<2; j++) {
				document.getElementById("gear"+i+"_spec"+j).innerHTML = "&nbsp;";
				document.getElementById("gearLite"+i+"_spec"+j).innerHTML = "&nbsp;";
				document.getElementById("gearLite"+i+"_spec"+j+"_add").innerHTML = "&nbsp;";
				document.getElementById("gearLite"+i+"_spec"+j+"_add").setAttribute('style','color: black;');
			}
		}

		document.getElementById("gearSet").innerText = (player.gear_set_cd != null ? player.gear_set_cd + "세트 (전체\+" + player.set_ablty + ")":"없음");
		document.getElementById("gearSetLite").innerText = (player.gear_set_cd != null ? player.gear_set_cd + "세트 (전체\+" + player.set_ablty + ")":"없음");

		var gearNameArray = gearNameInfo[player.batr_pitr_tp_cd];
		for (let i in gearNameArray) {
			var gear = gearNameArray[i];
			if (player[gear+"_id"] != null) {
				document.getElementById("gear"+i).innerText = allGearData[player[gear+"_id"]].name.split(" ")[0] + " (\+" + player[gear+"_upgrd_lv"] + ")";
				document.getElementById("gearLite"+i).innerText = allGearData[player[gear+"_id"]].name.split(" ")[0] + " (\+" + player[gear+"_upgrd_lv"] + ")";
				document.getElementById("gearLite"+i).setAttribute('style','font-size: '+(document.getElementById("gearLite"+i).innerText.length>7?'small;':''));
				var gearSpec = player[gear + "_spec"];
				for (let j=0; j<gearSpec.length; j++) {
					document.getElementById("gear"+i+"_spec"+j).innerText = gearSpec[j][0] + " " + gearSpec[j][1] + "(\+" + gearSpec[j][2] + ")";
					document.getElementById("gearLite"+i+"_spec"+j).innerText = gearSpec[j][0];
					document.getElementById("gearLite"+i+"_spec"+j+"_add").innerText = "+" + (gearSpec[j][1] + gearSpec[j][2]);
					document.getElementById("gearLite"+i+"_spec"+j+"_add").setAttribute('style','color: '+gearSpecColorArray[gearSpec[j][2]]);
					document.getElementById("gear"+i+"_target").innerHTML += "<option>"+gearSpec[j][0]+"</option>";
				}
			}
		}
		if (player.batr_pitr_tp_cd == "P") {
			document.getElementById("gearName0").innerText = "모자";
			document.getElementById("gearName1").innerText = "로진";
			document.getElementById("gearName2").innerText = "글러브";
			document.getElementById("gearNameLite0").innerText = "모자";
			document.getElementById("gearNameLite1").innerText = "로진";
			document.getElementById("gearNameLite2").innerText = "글러브";
		} else {
			document.getElementById("gearNameLite0").innerText = "헬멧";
			document.getElementById("gearNameLite1").innerText = "배트";
			document.getElementById("gearNameLite2").innerText = "스파이크";
			document.getElementById("gearName0").innerText = "헬멧";
			document.getElementById("gearName1").innerText = "배트";
			document.getElementById("gearName2").innerText = "스파이크";
		}

		systemText("선수 정보 불러오기가 완료되었습니다.");

		document.getElementById("playerNoBtn").onclick = function () {
			if (document.getElementById("playerNoBtn").innerText == "Show") {
				document.getElementById("playerNo").setAttribute('style','');
				document.getElementById("playerNoBtn").innerText = "Hide";
			} else {
				document.getElementById("playerNo").setAttribute('style','display:none;');
				document.getElementById("playerNoBtn").innerText = "Show";
			}
		}

		document.getElementById("growthCalc").onclick = function () { // 육성계산
			if(player.playing_cch_yn == "Y"){
				alert("코치는 육성할 수 없습니다.")
			} else {	
				if(player.batr_pitr_tp_cd == "B") {	
					document.getElementById("manageBtn").classList.toggle('on',false);
					document.getElementById("batterBtn").classList.toggle('on',true);
					document.getElementById("managePlayers").classList.toggle('on',false);
					document.getElementById("batterGrowthCalc").classList.toggle('on',true);
					document.getElementById("basicBatterGrowth").classList.toggle('on',true);
					document.getElementById("basicBatterGrowthBtn").classList.toggle('on',true);
					document.getElementById("detailBatterGrowth").classList.toggle('on',false);
					document.getElementById("detailBatterGrowthBtn").classList.toggle('on',false); // 타자육성 탭으로 전환
					b_calculateStat(abilityArray,player.age,true);
				} else {
					document.getElementById("manageBtn").classList.toggle('on',false);
					document.getElementById("pitcherBtn").classList.toggle('on',true);
					document.getElementById("managePlayers").classList.toggle('on',false);
					document.getElementById("pitcherGrowthCalc").classList.toggle('on',true);
					document.getElementById("basicPitcherGrowth").classList.toggle('on',true);
					document.getElementById("basicPitcherGrowthBtn").classList.toggle('on',true);
					document.getElementById("detailPitcherGrowth").classList.toggle('on',false);
					document.getElementById("detailPitcherGrowthBtn").classList.toggle('on',false); // 투수육성 탭으로 전환
					p_calculateStat(abilityArray,player.age,true);
				}
			}
		}

		document.getElementById("changeGenBtn").onclick = async function () {
			var targetGenType = document.getElementById("newGenType").options[document.getElementById("newGenType").selectedIndex].value;
			var result = await jQuery.get('https://ya9.naver.com/gmc/saveplrgentrng.nhn?selPlrNos=' + player.plr_no + ',&selGenTrngNos='+targetGenType + ',&dm=0');
			alert(result);
			getPlayerInfo(player.plr_no);
		}

		document.getElementById("goExp").onclick = function () { // 경전
			var targetExp = document.getElementById("targetExp").value;
			if(targetExp <= player.expr_lv) {
				alert("이미 목표 레벨에 도달한 선수입니다.");
			} else if (player.actn_tp_cd.length) {
				alert("퓨처스리그 출장, 특수훈련, 유학, 휴양, 판매등록 중인 선수는 경험전수를 진행할 수 없습니다.")
			} else {
				var con = confirm("취소할 수 없습니다. " + targetExp + "레벨 경험전수를 실행하시겠습니까?");
				if (con) {
					goExp(player,targetExp,document.getElementById("maxCP").value,0,true);
				}
			}
		}

		document.getElementById("goSpec").onclick = function () {
			var targetSpecName = document.getElementById("targetSpecName").options[document.getElementById("targetSpecName").selectedIndex].text;
			var targetSpecLevel = document.getElementById("targetSpecLevel").options[document.getElementById("targetSpecLevel").selectedIndex].text;
			if(player.age>35 || player.playing_cch_yn == "Y") {
				alert("자세교정을 진행할 수 없는 선수입니다.");
			} else if (player.actn_tp_cd.length) {
				alert("퓨처스리그 출장, 특수훈련, 유학, 휴양, 판매등록 중인 선수는 자세교정을 진행할 수 없습니다.")
			} else if (player.specLevel.match("S")) {
				var con = confirm("부스터를 사용한 선수는 타입변경만 가능합니다. " + targetSpecName + " 자세교정을 실행하시겠습니까?");
				if (con) {
					goSpec(player,targetSpecName,targetSpecLevel,true,document.getElementById("maxCP").value,0,true);
				}
			} else if (specLevelInfo[player.specLevel]<specLevelInfo[targetSpecLevel]) {
				alert("목표 레벨이 너무 낮습니다.");
			} else if (player.specLevel == targetSpecLevel && player.specName == targetSpecName) {
				alert("이미 목표 타입과 레벨에 도달한 선수입니다.");
			} else {
				var con = confirm("취소할 수 없습니다. " + targetSpecName + " " + targetSpecLevel + " 자세교정을 실행하시겠습니까?");
				if (con) {
					goSpec(player,targetSpecName,targetSpecLevel,false,document.getElementById("maxCP").value,0,true);
				}
			}
		}

		var gearButtons = document.getElementsByClassName("gearButton");
		gearButtons = Array.from(gearButtons);
		for(let btn of gearButtons) {
			btn.onclick = function () {
				i = gearButtons.indexOf(btn);
				var catg = gearNameInfo[player.batr_pitr_tp_cd][i];
				var targetGearSpec = document.getElementById("gear" + i + "_target").options[document.getElementById("gear" + i + "_target").selectedIndex].text;
				if (player[catg+"_id"] == null) {
					alert("장비가 없습니다.");
				} else if (player[catg + "_upgrd_lv"] == 5) {
					alert("이미 최대 레벨에 도달한 장비입니다.");
				} else {
					var con = confirm("취소할 수 없습니다. " + targetGearSpec + " 장비강화를 실행하시겠습니까?");
					if (con) {
						gearUpgrade(player,catg,targetGearSpec,document.getElementById("maxCP").value,0,true);
					}
				}
			}
		}

		document.getElementById("trainSpAbility").onclick = async function () {
			if(player.spAbilityArray.length == 10) {
				alert("더 이상 특훈을 진행할 수 없습니다.");
			} else if (player.actn_tp_cd.length) {
				alert("퓨처스리그 출장, 특수훈련, 유학, 휴양, 판매등록 중인 선수는 특훈을 진행할 수 없습니다.")
			} else {
				var con = confirm("취소할 수 없습니다. 실행하시겠습니까?");
				if (con) {
					trainSpAbility(player,document.getElementById("maxCP").value,0,true);
				}
			}
		}

		document.getElementById("getCP").onclick = async function () {
			var data = await jQuery.getJSON('https://ya9.naver.com/gmc/getcash.nhn');
			document.getElementById("maxCP").value = Math.floor(data.cp/10000);
		}
	}

	function getGearSpec(gearId,gearData,pl) { // 장비 불러오기
		var gearSpecArray = [];
		for (let spec of gearConvertArray[0]) {
			if (gearData[gearId][spec]>0) {
				gearSpecArray.push([convert(spec,gearConvertArray,"기타"),gearData[gearId][spec],(pl["gear_"+spec]-gearData[gearId][spec])]);
			}
		}
		return gearSpecArray;
	}

	async function goExp (player,targetLv,maxCP,usedCP,notyet) { // 자동경전

		const expCPArray = [
			[0,0,0,0,0],
			[1000,1200,1500,2000,3000],
			[1000,1200,1500,2000,3000],
			[1000,1200,1500,2000,3000],
			[1000,1200,1500,2000,3000],
			[1000,1200,1500,2000,3000],
			[2000,2400,3000,4000,6000],
			[3000,3600,4500,6000,9000],
			[5000,6000,7500,10000,15000],
			[7000,8400,10500,14000,21000],
			[10000,12000,15000,20000,30000]
		];

		if (notyet) {
			var nextUsedCP = usedCP + expCPArray[player.lv][player.expr_lv];
			if (nextUsedCP > maxCP * 10000) {
				systemText("최대 CP를 사용하여 경험전수를 중단합니다. 현재 경험전수 레벨: " + player.expr_lv);
				alert("최대 CP를 사용하여 경험전수를 중단합니다. 현재 경험전수 레벨: " + player.expr_lv);
				notyet = false;
			} else {
				usedCP = nextUsedCP;
				var data = await jQuery.getJSON('https://ya9.naver.com/gmc/plrexplvteach.nhn?levelUpNo=' + player.plr_no);
				if (data.result != "success") {
					systemText("오류가 발생하여 경험전수를 중단합니다. 에러코드 " + data.result);
					alert("오류가 발생하여 경험전수를 중단합니다. 에러코드 " + data.result);
					notyet = false;
				} else {
					if (data.levelUpSuccess) {
						player.expr_lv ++;
						document.getElementById("playerExp").innerText = player.expr_lv;
						if (player.expr_lv == targetLv) {
							systemText("경험전수 성공! 총 소요 " + usedCP + "CP");
							alert("경험전수 성공! 총 소요 " + usedCP + "CP");
							notyet = false;
						} else {
							systemText(data.nextExprLevel + '레벨 성공! 현재 ' + usedCP + 'CP 소모');
						}
					} else {
						systemText(data.nextExprLevel+'레벨 실패; 현재 ' + usedCP + 'CP 소모');
					}
				}
				setTimeout(function(){goExp(player,targetLv,maxCP,usedCP,notyet);},1000);
			}
		} else {
			getPlayerInfo(player.plr_no);
		}
	};

	async function goSpec (player,targetName,targetLv,booster,maxCP,usedCP,notyet) { // 자동자교

		const specCPArray = [0,500,500,500,500,1000,2000,4000,6000,8000,10000];

		const specTypeInfo = {
			"B":{"정확":"A","파워":"A","정신":"A","선구":"B","주력":"B","수비":"B"},
			"P":{"구위":"A","제구":"A","정신":"A","구속":"B","변화":"B","체력":"B"}
		};

		if (notyet) {
			var nextUsedCP = usedCP + specCPArray[player.lv];
			if (nextUsedCP>maxCP*10000) {
				systemText("최대 CP를 사용하여 자세교정을 중단합니다. 현재 성장특성: " + player.specName + " " + player.specLevel);
				alert("최대 CP를 사용하여 자세교정을 중단합니다. 현재 성장특성: " + player.specName + " " + player.specLevel);
				notyet = false;
			} else if (player.specName != targetName) {
				usedCP = nextUsedCP;
				var dataRaw = await jQuery.get('https://ya9.naver.com/gmc/plrposechange.nhn?plrNo=' + player.plr_no + '&kind=' + specTypeInfo[player.batr_pitr_tp_cd][targetName]);
				var dataRawHTML = parser.parseFromString(dataRaw, 'text/html');
				var result = dataRawHTML.getElementsByClassName("s")[0].innerText;
				if (result.match("실패")) {
					systemText("타입변경 실패; 현재 " + usedCP + "CP 소모");
				} else {
					player.specName = result.split("에서 ")[1].slice(0,2);
					systemText("타입변경 성공! (\=\>" + player.specName + ") 현재 " + usedCP + "CP 소모");
					document.getElementById("playerSpec").innerText = player.specName + " " + player.specLevel;
				}
			} else if (specLevelInfo[player.specLevel] == specLevelInfo[targetLv] || booster) {
				systemText("자세교정 완료! 총 소요 " + usedCP + "CP");
				alert("자세교정 완료! 총 소요 " + usedCP + "CP");
				document.getElementById("playerSpec").innerText = player.specName + " " + player.specLevel;
				notyet = false;
			} else {
				usedCP = nextUsedCP;
				var dataRaw = await jQuery.get('https://ya9.naver.com/gmc/plrposecorrection.nhn?plrNo=' + player.plr_no);
				var dataRawHTML = parser.parseFromString(dataRaw, 'text/html');
				var result = dataRawHTML.getElementsByClassName("s")[0].innerText;
				if (result.match("실패")) {
					systemText("등급변경 실패; 현재 " + usedCP + "CP 소모");
				} else {
					player.specLevel = specNextLevelInfo[player.specLevel];
					systemText("등급변경 성공! (\=\>" + player.specLevel + ") 현재 " + usedCP + "CP 소모");
					document.getElementById("playerSpec").innerText = player.specName + " " + player.specLevel;
				}
			}
			setTimeout(function(){goSpec(player,targetName,targetLv,booster,maxCP,usedCP,notyet);},1000);
		} else {
			getPlayerInfo(player.plr_no);
		}
	};

	async function gearUpgrade(player,gearCatg,target,maxCP,usedCP,notyet) { // 장비강화 (텍스트 잘 바뀌는지 확인필요)
		const gearCPArray = [20000,60000,100000,150000,200000];

		var resultSpec = "";
		if (notyet) {
			var nextUsedCP = usedCP + gearCPArray[player[gearCatg + "_upgrd_lv"]];
			if (nextUsedCP > maxCP*10000) {
				systemText("최대 CP를 사용하여 장비강화를 중단합니다.");
				alert("최대 CP를 사용하여 장비강화를 중단합니다.");
				notyet = false;
			} else {
				var data = await jQuery.getJSON('https://ya9.naver.com/gmc/upgradegear.nhn?plrno='+ player.plr_no + '&catg=' + gearCatg + '&bpcode=' + player.batr_pitr_tp_cd);
				if (!data.result) {
					if (data.msg == "no_ticket") {
						systemText("강화권이 부족하여 장비강화를 중단합니다.");
						alert("강화권이 부족하여 장비강화를 중단합니다.");
					} else if (data.msg == "cp") {
						systemText("CP가 부족하여 장비강화를 중단합니다.");
						alert("CP가 부족하여 장비강화를 중단합니다.");
					} else {
						systemText("오류가 발생하여 장비강화를 중단합니다. 에러코드 " + data.msg);
						alert("오류가 발생하여 장비강화를 중단합니다. 에러코드 " + data.msg);
					}
					notyet = false;
				} else {
					usedCP = nextUsedCP;
					var upgradeData = JSON.parse(data.ability.replace(/\\/g,""));
					var seq = upgradeData.upgrdSeq;
					for (let spec of gearConvertArray[0]) {
						if (upgradeData[spec] > 0) {
							resultSpec = convert(spec,gearConvertArray,"기타");
							break;
						}
					}
					if (target == resultSpec || target == "랜덤") {
						await jQuery.getJSON('https://ya9.naver.com/gmc/commitupgradegear.nhn?upgrdSeq=' + seq + '&bpcode=' + player.batr_pitr_tp_cd);
						systemText("장비강화 성공! (\=\>" + resultSpec + ") 총 소요 " + usedCP + "CP");
						alert("장비강화 성공! (\=\>" + resultSpec + ") 총 소요 " + usedCP + "CP");
						notyet = false;
					} else {
						await jQuery.getJSON('https://ya9.naver.com/gmc/cancelupgradegear.nhn?upgrdSeq=' + seq + '&bpcode=' + player.batr_pitr_tp_cd);
						systemText("장비강화 실패; (\=\>" + resultSpec + ") 현재 " + usedCP + "CP 소모");
					}
				}
			}
			setTimeout(function(){gearUpgrade(player,gearCatg,target,maxCP,usedCP,notyet);},1000);
		} else {
			getPlayerInfo(player.plr_no);
		}
	}

	async function deleteSpAbility (player,spAbilityNo) {
		var deleteSpAbilityJSON = await jQuery.getJSON('https://ya9.naver.com/gmc/removeptcryablty.nhn?player='+player.plr_no + '&ability=' + spAbilityNo);
		alert("특수능력 삭제에 " + (deleteSpAbilityJSON.result ? "성공":"실패") + "하였습니다.");
		getPlayerInfo(player.plr_no);
	}

	async function trainSpAbility (player,maxCP,usedCP,notyet) { // 자동특훈
		if (notyet) {
			var time=3000;
			var targetSpAbilityArray = [];
			var ownSpAbilityArray = [];
			if (document.getElementById("legendSpAbility").value != "") {
				for (let sp of document.getElementById("legendSpAbility").value.split(/\s|,/)) {
					targetSpAbilityArray.push("전설_"+sp);
				}
			}
			if (document.getElementById("sSpAbility").value != "") {
				for (let sp of document.getElementById("sSpAbility").value.split(/\s|,/)) {
					targetSpAbilityArray.push("S"+sp);
				}
			}
			if (document.getElementById("otherSpAbility").value != "") {
				for (let sp of document.getElementById("otherSpAbility").value.split(/\s|,/)) {
					targetSpAbilityArray.push(sp);
				}
			}
			if (document.getElementById("ownSpAbility").checked) {
				ownSpAbilityArray = spAbilityTypeArray.filter(obj => obj.type == "고특")[0].array.concat(spAbilityTypeArray.filter(obj => obj.type == "L고특")[0].array);
			}
			var nextUsedCP = usedCP + 3000;
			if (nextUsedCP > maxCP*10000) {
				systemText("최대 CP를 사용하여 특훈을 중단합니다.");
				alert("최대 CP를 사용하여 특훈을 중단합니다.");
				time=500;
				notyet = false;
			} else {
				usedCP = nextUsedCP;
				var newSpAbilityJSON = await jQuery.getJSON('https://ya9.naver.com/gmc/trainptcryablty.nhn?player='+player.plr_no);
				var newSpAbility = allSpAbilityData[newSpAbilityJSON.context.ptcry_ablty_no];
				await jQuery.getJSON('https://ya9.naver.com/gmc/applyptcryablty.nhn');
				if (targetSpAbilityArray.filter(abl => newSpAbility.ptcry_ablty_nm.match(abl)).length>0 || ownSpAbilityArray.includes(newSpAbility.ptcry_ablty_no)) {
					systemText("특수능력 [" + newSpAbility.ptcry_ablty_nm + "]을(를) 습득하였습니다! 총 소요 " + usedCP + "CP");
					alert("특수능력 [" + newSpAbility.ptcry_ablty_nm + "]을(를) 습득하였습니다! 총 소요 " + usedCP + "CP");
					time=500;
					notyet = false;
				} else {
					await jQuery.getJSON('https://ya9.naver.com/gmc/removeptcryablty.nhn?player='+player.plr_no + '&ability=' + newSpAbility.ptcry_ablty_no)
					systemText("특수능력 [" + newSpAbility.ptcry_ablty_nm + "]을(를) 포기하였습니다. 현재 " + usedCP + "CP 소모");
				}
			}
			setTimeout(function(){trainSpAbility (player,maxCP,usedCP,notyet);},time);
		} else {
			getPlayerInfo(player.plr_no);
		}
	}

	// 선수 관리 끝

	// 타자 육성 시작

	document.getElementById('basicBatterGrowthBtn').onclick = function() {
		document.getElementById('basicBatterGrowthBtn').classList.toggle('on',true);
		document.getElementById('basicBatterGrowth').classList.toggle('on',true);
		document.getElementById('detailBatterGrowthBtn').classList.toggle('on',false);
		document.getElementById('detailBatterGrowth').classList.toggle('on',false);
		b_calculateStat([],18,false);
	}

	document.getElementById('detailBatterGrowthBtn').onclick = function() {
		document.getElementById('detailBatterGrowthBtn').classList.toggle('on',true);
		document.getElementById('detailBatterGrowth').classList.toggle('on',true);
		document.getElementById('basicBatterGrowthBtn').classList.toggle('on',false);
		document.getElementById('basicBatterGrowth').classList.toggle('on',false);
		b_calculateStatAdvanced([],18,false);
	}

	function b_calculateStat(initStatArray,initAge,initStatGiven){ // 타자 성장 계산
	
		var drill = document.getElementsByName("b_drill");
		var spec = document.getElementsByName("b_spec");
		spec = Array.from(spec);

		var log = document.getElementById("b_log");

		for (i = 0; i<8; i++){
			drill[i].checked = false;
			spec[i].innerHTML = "<option>-</option>";
			for (let level of batterSpecLevelArray) {
				spec[i].innerHTML += "<option>"+level+"</option>";
			}
			spec[i].selectedIndex = 0;
		} // 일훈 특화 초기화 (항상)

		var stat = document.getElementsByName("b_bas_stat");
		stat = Array.from(stat);

		var level = document.getElementById("b_level");
		var perc = document.getElementById("b_perc");

		var age = document.getElementById("b_age");
		var chance = document.getElementById("b_cha");

		if(initStatGiven){
			for (let i=0; i<8; i++) {
				stat[i].value = (initStatArray[i]/10000).toFixed(2);
			}
			level.innerText = getLevelPerc(initStatArray,"B").level;
			perc.innerText = getLevelPerc(initStatArray,"B").perc;

			age.value = initAge;
			chance.value = 119;

			initTable(log);

			b_statArray.length = 0;
			b_savedStatNum = 0;
		} // 최초스탯이 주어진 경우 최초스탯으로 설정 및 기록 초기화
	
		document.getElementById("b_undo").onclick = async function(){
			if(b_savedStatNum>0){
				for (let i=0; i<8; i++) {
					stat[i].value = (b_statArray[b_savedStatNum-1].stat[i]/10000).toFixed(2);
					drill[i].checked = (i==b_statArray[b_savedStatNum-1].drillMarker);
					spec[i].selectedIndex = (i==b_statArray[b_savedStatNum-1].specMarker ? specLevelInfo[b_statArray[b_savedStatNum-1].specLevel]:0);
				}
				level.innerText = b_statArray[b_savedStatNum-1].level;
				perc.innerText = b_statArray[b_savedStatNum-1].perc;

				age.value = b_statArray[b_savedStatNum-1].age;
				chance.value = b_statArray[b_savedStatNum-1].chance;

				log.getElementsByTagName("tbody")[0].deleteRow(b_savedStatNum-1);

				b_savedStatNum--;
				b_statArray.length = b_savedStatNum;
			}
			else{
				alert("저장된 데이터가 없습니다!");
			}
		}
	
		document.getElementById("b_reset").onclick = function(){
			b_statArray.length = 0;
			b_savedStatNum = 0;
			for (i=0; i<8; i++) {
				stat[i].value = 99.99;
			}

			level.innerText = 10;
			perc.innerText = 99;

			initTable(log);
	
			age.value = 18; // 나이 초기화
			chance.value = 119; // 5타석 경기수 초기화
		}
	
		document.getElementById("b_start").onclick = async function(){
			if (age.value > 45) {
				alert("최대 나이는 45세입니다.")
			} else if (spec.filter(elt => elt.selectedIndex>0).length>1) {
				alert("특화는 한가지만 선택할 수 있습니다.");
			} else {
				var specMarker = -1;
				var specLevel = "";
				var drillMarker = -1;
				if (spec.filter(elt => elt.selectedIndex>0).length==1) {
					specMarker = spec.indexOf(spec.filter(elt =>elt.selectedIndex>0)[0]);
					specLevel = spec.filter(elt =>elt.selectedIndex>0)[0].value;
				}
				if (specLevel == "S" && age.value >35) {
					alert("부스터는 35세까지만 가능합니다.");
				} else {
					for (let i=0; i<8; i++) {
						if (drill[i].checked) {
							drillMarker = i;
							break;
						}
					}
					var oldData = new Object();
					oldData.stat = [];
					for (let i=0; i<8; i++) {
						oldData.stat.push(Number(stat[i].value*10000));
					}
					oldData.bp = "B";
					oldData.level = level.innerText;
					oldData.perc = perc.innerText;
					oldData.age = Number(age.value);
					oldData.chance = Number(chance.value);
					oldData.specMarker = specMarker;
					oldData.specLevel = specLevel;
					oldData.drillMarker = drillMarker;
					b_statArray.push(oldData);
					var tdArray = [
						{"text":oldData.age}, // 나이
						{"text":(specMarker!=-1?specNameInfoKor[oldData.bp][oldData.specMarker] + " " + oldData.specLevel:"-")}, // 특화
						{"text":(drillMarker!=-1?specNameInfoKor[oldData.bp][oldData.drillMarker]:"-")}, // 일훈
						{"text":oldData.chance+"/119"} // 5타석
					]
					var newRow = makeRow(tdArray);
					log.children[1].appendChild(newRow);
					
					var newData = JSON.parse(JSON.stringify(oldData));
					for (let i=0; i<119; i++) {
						newData = await oneGameGrowth(newData,i,119);
					}
					for (let i=0; i<8; i++) {
						stat[i].value = (newData.stat[i]/10000).toFixed(2);
					}
					level.innerText = getLevelPerc(newData.stat,"B").level;
					perc.innerText = getLevelPerc(newData.stat,"B").perc;
					age.value = Number(age.value) +1;
					b_savedStatNum ++;
				}
			}
		}

		document.getElementById("b_update").onclick = function() {
			var currStatArray = [];
			for (i=0; i<8; i++) {
				currStatArray.push(stat[i].value*10000);
			}
			level.innerText = getLevelPerc(currStatArray,"B").level;
			perc.innerText = getLevelPerc(currStatArray,"B").perc;
		}

		document.getElementById("b_advanced").onclick = function(){
			var statArray = [];
			for (i=0; i<8; i++) {
				statArray.push(stat[i].value*10000);
			}
			document.getElementById('detailBatterGrowthBtn').classList.toggle('on',true);
			document.getElementById('detailBatterGrowth').classList.toggle('on',true);
			document.getElementById('basicBatterGrowthBtn').classList.toggle('on',false);
			document.getElementById('basicBatterGrowth').classList.toggle('on',false);
			b_calculateStatAdvanced(statArray,age.value,true);
		}
	}

	function b_calculateStatAdvanced(initStatArray,initAge,initStatGiven) { // 타자 상세육성
		var drill = document.getElementsByName("b_adv_drill");
		var spec0 = document.getElementsByName("b_adv_spec_reg");
		spec0 = Array.from(spec0);
		var spec1 = document.getElementsByName("b_adv_spec_sat");
		spec1 = Array.from(spec1);
		var satLeague = document.getElementById("b_adv_sat");
		
		for (let i = 0; i<drill.length; i++){
			drill[i].checked = false;
			spec0[i].innerHTML = "<option>-</option>";
			spec1[i].innerHTML = "<option>-</option>";
			for (let level of batterSpecLevelArray) {
				spec0[i].innerHTML += "<option>"+level+"</option>";
				spec1[i].innerHTML += "<option>"+level+"</option>";
			}
			spec0[i].selectedIndex = 0;
			spec1[i].selectedIndex = 0;
		} // 일훈, 특화 초기화 (항상)

		var stat = document.getElementsByName("b_adv_stat");
		stat = Array.from(stat);

		var level = document.getElementById("b_adv_level");
		var perc = document.getElementById("b_adv_perc");

		var age = document.getElementById("b_adv_age");
		var chance = document.getElementById("b_adv_cha");
		var totalGame = document.getElementById("b_adv_total");
		var satChance = document.getElementById("b_adv_satCha");
		var satTotalGame = document.getElementById("b_adv_satTotal");

		var log = document.getElementById("b_adv_log");

		if(initStatGiven) {
			for (let i=0; i<8; i++) {
				stat[i].value = (initStatArray[i]/10000).toFixed(2);
			}
			level.innerText = getLevelPerc(initStatArray,"B").level;
			perc.innerText = getLevelPerc(initStatArray,"B").perc;
			age.value = initAge;
			chance.value = 119;
			totalGame.value = 119;
			satLeague.checked=false;
			for (let i=0; i<8; i++) {
				spec1[i].disabled = true;
			}
			satChance.value = 21;
			satTotalGame.value = 21;
			b_adv_statArray.length = 0;
			b_adv_savedStatNum = 0;

			initTable(log);
			// 넘어온 스탯으로 설정 및 기록 초기화
		}

		satLeague.onclick = function () {
			for (let i=0; i<8; i++) {
				spec1[i].selectedIndex = 0;
				spec1[i].disabled = !satLeague.checked || (i==4) || (i==5);
			}
		}

		document.getElementById("load_totalGame").onclick = async function(){
			var gameData = await jQuery.getJSON('https://ya9.naver.com/gmc/getheader.nhn');
			chance.value = 119 - gameData.stat.game_cnt;
			totalGame.value = chance.value;
		}

		document.getElementById("b_adv_undo").onclick = function(){
			if(b_adv_savedStatNum>0){
				for (let i=0; i<8; i++) {
					stat[i].value = (b_adv_statArray[b_adv_savedStatNum-1].stat[i]/10000).toFixed(2);
					drill[i].checked = (i==b_adv_statArray[b_adv_savedStatNum-1].drillMarker);
					spec0[i].selectedIndex = (i==b_adv_statArray[b_adv_savedStatNum-1].specMarker0 ? specLevelInfo[b_adv_statArray[b_adv_savedStatNum-1].specLevel0]:0);
					spec1[i].selectedIndex = (i==b_adv_statArray[b_adv_savedStatNum-1].specMarker1 ? specLevelInfo[b_adv_statArray[b_adv_savedStatNum-1].specLevel1]:0);
				}
				level.innerText = b_adv_statArray[b_adv_savedStatNum-1].level;
				perc.innerText = b_adv_statArray[b_adv_savedStatNum-1].perc;
				chance.value = b_adv_statArray[b_adv_savedStatNum-1].chance;
				totalGame.value = b_adv_statArray[b_adv_savedStatNum-1].totalGame;
				satLeague.checked = b_adv_statArray[b_adv_savedStatNum-1].sat;
				for (let i=0; i<8; i++) {
					spec1[i].disabled = !satLeague.checked || (i==4) || (i==5);
				}
				satChance.value = b_adv_statArray[b_adv_savedStatNum-1].satChance;
				satTotalGame.value = b_adv_statArray[b_adv_savedStatNum-1].satTotalGame;
				age.value = b_adv_statArray[b_adv_savedStatNum-1].age;
				log.getElementsByTagName("tbody")[0].deleteRow(b_adv_savedStatNum-1);
				b_adv_savedStatNum--;
				b_adv_statArray.length = b_adv_savedStatNum;
			}
			else{
				alert("저장된 데이터가 없습니다!");
			}
		}
	
		document.getElementById("b_adv_reset").onclick = function(){
			b_adv_statArray.length = 0;
			b_adv_savedStatNum = 0;
			for (let i=0;i<8; i++) {
				stat[i].value = 99.99;
			}

			level.innerText = 10;
			perc.innerText = 99;

			initTable(log);
	
			age.value = 18; // 나이 초기화
			chance.value = 119; // 5타석 경기수 초기화
			totalGame.value = 119;
			satLeague.checked = false;
			for (let i=0; i<8; i++) {
				spec0[i].selectedIndex = 0;
				spec1[i].selectedIndex = 0;
				spec1[i].disabled = true;
			}
			satChance.value = 21;
			satTotalGame.value = 21;
		}
	
		document.getElementById("b_adv_start").onclick = async function(){

			if (age.value > 45) {
				alert("최대 나이는 45세입니다.")
			} else if (spec0.filter(elt => elt.selectedIndex>0).length>1 || spec1.filter(elt => elt.selectedIndex>0).length>1) {
				alert("특화는 정규/토요 각각 한가지씩만 선택할 수 있습니다.");
			} else {
				var specMarker0 = -1;
				var specLevel0 = "";
				var specMarker1 = -1;
				var specLevel1 = "";
				var drillMarker = -1;
				if (spec0.filter(elt => elt.selectedIndex>0).length==1) {
					specMarker0 = spec0.indexOf(spec0.filter(elt =>elt.selectedIndex>0)[0]);
					specLevel0 = spec0.filter(elt =>elt.selectedIndex>0)[0].value;
				}
				if (spec1.filter(elt => elt.selectedIndex>0).length==1) {
					specMarker1 = spec1.indexOf(spec1.filter(elt =>elt.selectedIndex>0)[0]);
					specLevel1 = spec1.filter(elt =>elt.selectedIndex>0)[0].value;
				}
				var val = false;
				if (age.value < 36) {
					val = true;
				} else if (satLeague.checked) {
					val = (specMarker0 == -1) && (specMarker1 == -1);
				} else {
					val = (specMarker0 == -1);
				}
				if (age.value > 35 && (specLevel0 == "S" || specLevel1 == "S")) {
					alert("부스터는 35세까지만 가능합니다.")
				} else {
					for (let i=0; i<8; i++) {
						if (drill[i].checked) {
							drillMarker = i;
							break;
						}
					}
					var oldData = new Object();
					oldData.stat = [];
					for (let i=0; i<8; i++) {
						oldData.stat.push(Number(stat[i].value*10000));
					}
					oldData.bp = "B";
					oldData.level = level.innerText;
					oldData.perc = perc.innerText;
					oldData.age = Number(age.value);
					oldData.chance = Number(chance.value);
					oldData.specMarker0 = specMarker0;
					oldData.specLevel0 = specLevel0;
					oldData.specMarker1 = specMarker1;
					oldData.specLevel1 = specLevel1;
					oldData.drillMarker = drillMarker;
					oldData.totalGame = Number(totalGame.value);
					oldData.sat = satLeague.checked;
					oldData.satChance = Number(satChance.value);
					oldData.satTotalGame = Number(satTotalGame.value);

					b_adv_statArray.push(oldData);

					var tdArray = [
						{"text":oldData.age}, // 나이
						{"text":(specMarker0!=-1?specNameInfoKor[oldData.bp][oldData.specMarker0] + " " + oldData.specLevel0:"-")}, // 특화 (정규)
						{"text":((oldData.sat && specMarker1!=-1)?specNameInfoKor[oldData.bp][oldData.specMarker1] + " " + oldData.specLevel1:"-")}, // 특화 (토요)
						{"text":(drillMarker!=-1?specNameInfoKor[oldData.bp][oldData.drillMarker]:"-")}, // 일훈
						{"text":oldData.chance+"/" + oldData.totalGame}, // 5타석 (정규)
						{"text":(oldData.sat?oldData.satChance+"/"+oldData.satTotalGame:"-")} // 5타석 (토요)
					]
					var newRow = makeRow(tdArray);
					log.children[1].appendChild(newRow);

					var newData = JSON.parse(JSON.stringify(oldData));
					newData.specMarker = specMarker0;
					newData.specLevel = specLevel0;
					console.log(newData);
					for (let i=0; i<totalGame.value; i++) {
						newData = await oneGameGrowth(newData,i,totalGame.value);
					}
					if (satLeague.checked) {
						newData.specMarker = specMarker1;
						newData.specLevel = specLevel1;
						newData.chance = Number(satChance.value);
						for (let i=0; i<satTotalGame.value; i++) {
							newData = await oneGameGrowth(newData,i,satTotalGame.value);
						}
					}
					for (let i=0; i<8; i++) {
						stat[i].value = (newData.stat[i]/10000).toFixed(2);
					}
					level.innerText = getLevelPerc(newData.stat,"B").level;
					perc.innerText = getLevelPerc(newData.stat,"B").perc;
					age.value = Number(age.value) +1;
					chance.value = 119;
					totalGame.value = 119;
					satChance.value = 21;
					satTotalGame.value = 21;
					b_adv_savedStatNum ++;
				}
			}
		}

		document.getElementById("b_adv_update").onclick = function() {
			var currStatArray = [];
			for (i=0; i<8; i++) {
				currStatArray.push(stat[i].value*10000);
			}
			level.innerText = getLevelPerc(currStatArray,"B").level;
			perc.innerText = getLevelPerc(currStatArray,"B").perc;
		}

		document.getElementById("b_basic").onclick = function(){
			var statArray = [];
			for (i=0; i<8; i++) {
				statArray.push(stat[i].value*10000);
			}
			document.getElementById('basicBatterGrowthBtn').classList.toggle('on',true);
			document.getElementById('basicBatterGrowth').classList.toggle('on',true);
			document.getElementById('detailBatterGrowthBtn').classList.toggle('on',false);
			document.getElementById('detailBatterGrowth').classList.toggle('on',false);
			b_calculateStat(statArray,age.value,true);
		}
	}

	function oneGameGrowth(data,gameNo,totalGameNo) {
		
		var intervalArray = [0,0,0,0,0,0,0,0];
	
		for(let i = 0; i<8; i++){
			intervalArray[i] = getInterval(data.stat[i]);
		} // 성장구간 저장

		var weight;
		var maxInterval;
		if (data.bp == "B") {
			weight = Math.floor((data.chance-gameNo-1)/totalGameNo)*0.2+1; // 5타석시 1, 4타석시 0.8 (타자)
			maxInterval = Math.max(intervalArray[0],intervalArray[1],intervalArray[2],intervalArray[3],intervalArray[7]);
		} else {
			weight = (!(gameNo%2)*0.96+1.04)*(gameNo < Math.round(data.wari * 36)); // 한계이닝 채울 떄까지 2, 1.04 반복, 그 다음 0
			maxInterval = Math.max(intervalArray[0],intervalArray[1],intervalArray[2],intervalArray[3],intervalArray[4]);
		}

		if(data.specMarker > -1) {
			if (data.specMarker == 6 || intervalArray[data.specMarker] == maxInterval) { // 정신특이거나 간섭효과 없는 경우 모든 성장구간은 특화와 같음
				for (j=0; j<8; j++) {
					intervalArray[j] = intervalArray[data.specMarker];
				}
			} else { // 간섭효과 있는 경우 비특화 성장구간은 자신과 특화 성장구간 중 큰 것으로, 특화 성장구간은 하나 올라감
				for (let j=0; j<8; j++) {
					intervalArray[j] = Math.max(intervalArray[j],intervalArray[data.specMarker]);
				}
				intervalArray[data.specMarker] ++;
			}

			for (let j=0; j<8; j++) { // 성장
				data.stat[j] += addStatInfo[data.bp+data.specLevel][intervalArray[j]][Math.max(data.age-25,0)]*weight*(j==data.specMarker ? 1:0.3);
			}
		}

		data.stat[data.drillMarker] += 50; // 일훈

		for(let j = 0; j<8; j++){
			if (data.stat[j]>999900){
				data.stat[j] = 999900;
			}
		} // 최고 스탯 고정
		
		return data;
	}

	function getLevelPerc(statArray,bp) {
		const statWeightInfo = {
			"B": [15,15,5,4,0,0,10,5],
			"P": [10,12,10,12,11,0,11,0]
		}
		const levelThresholdInfo = {
			"B": [0,20400000,20720000,23350000,27640000,31750000,34110000,36290000,38045000,40250000,54000000],
			"P": [0,24760000,26450000,30220000,34470000,38170000,40822000,43540000,46185000,48900000,66000000]
		}

		var totalStat = 0;
		var levelPerc = new Object();
		for (let i=0;i<8;i++) {
			totalStat += statWeightInfo[bp][i]*statArray[i];
		}
		for (let i=0; i<11;i++) {
			if (totalStat < levelThresholdInfo[bp][i]) {
				levelPerc.level = i;
				levelPerc.perc = Math.floor((totalStat - levelThresholdInfo[bp][i-1])*100/(levelThresholdInfo[bp][i]-levelThresholdInfo[bp][i-1]));
				break;
			}
		}
		return levelPerc;
	}

	// 타자 육성 끝

	// 투수 육성 시작

	document.getElementById('basicPitcherGrowthBtn').onclick = function() {
		document.getElementById('basicPitcherGrowthBtn').classList.toggle('on',true);
		document.getElementById('basicPitcherGrowth').classList.toggle('on',true);
		document.getElementById('detailPitcherGrowthBtn').classList.toggle('on',false);
		document.getElementById('detailPitcherGrowth').classList.toggle('on',false);
		p_calculateStat([],18,false);
	}

	document.getElementById('detailPitcherGrowthBtn').onclick = function() {
		document.getElementById('detailPitcherGrowthBtn').classList.toggle('on',true);
		document.getElementById('detailPitcherGrowth').classList.toggle('on',true);
		document.getElementById('basicPitcherGrowthBtn').classList.toggle('on',false);
		document.getElementById('basicPitcherGrowth').classList.toggle('on',false);
		p_calculateStatAdvanced([],18,false);
	}
	
	function p_calculateStat(initStatArray,initAge,initStatGiven){ // 투수 성장 계산
		
		var drill = document.getElementsByName("p_drill");
		var spec = document.getElementsByName("p_spec");
		spec = Array.from(spec);

		for (i = 0; i<8; i++){
			drill[i].checked = false;
			spec[i].innerHTML = "<option>-</option>"
			for (let level of pitcherSpecLevelArray) {
				spec[i].innerHTML += "<option>"+level+"</option>";
			}
			spec[i].selectedIndex = 0;
		} // 일훈 특화 초기화 (항상)

		var stat = document.getElementsByName("p_bas_stat");
		stat = Array.from(stat);

		var level = document.getElementById("p_level");
		var perc = document.getElementById("p_perc");

		var age = document.getElementById("p_age");
		var wari = document.getElementById("p_war");

		var log = document.getElementById("p_log");

		if(initStatGiven){
			for (let i=0; i<8; i++) {
				stat[i].value = (initStatArray[i]/10000).toFixed(2);
			}
			level.innerText = getLevelPerc(initStatArray,"P").level;
			perc.innerText = getLevelPerc(initStatArray,"P").perc;
			age.value = initAge;
			wari.value = 1;
			initTable(log);
			p_statArray.length = 0;
			p_savedStatNum = 0;
		} // 최초스탯이 주어진 경우 최초스탯으로 설정 및 기록 초기화
	
		document.getElementById("p_undo").onclick = function(){
			if(p_savedStatNum>0){
				for (let i=0; i<8; i++) {
					stat[i].value = (p_statArray[p_savedStatNum-1].stat[i]/10000).toFixed(2);
					drill[i].checked = (i==p_statArray[p_savedStatNum-1].drillMarker);
					spec[i].selectedIndex = (i==p_statArray[p_savedStatNum-1].specMarker ? specLevelInfo[p_statArray[p_savedStatNum-1].specLevel]:0);
				}
				level.innerText = p_statArray[p_savedStatNum-1].level;
				perc.innerText = p_statArray[p_savedStatNum-1].perc;
				age.value = p_statArray[p_savedStatNum-1].age;
				wari.value = p_statArray[p_savedStatNum-1].wari;
				log.getElementsByTagName("tbody")[0].deleteRow(p_savedStatNum-1);

				p_savedStatNum--;
				p_statArray.length = p_savedStatNum;
			} else{
				alert("저장된 데이터가 없습니다!");
			}
		}
	
		document.getElementById("p_reset").onclick = function(){
			p_statArray.length = 0;
			p_savedStatNum = 0;
			for (i=0;i<8;i++) {
				stat[i].value = 99.99;
			}

			level.innerText = 10;
			perc.innerText = 99;

			initTable(log);
	
			age.value = 18; // 나이 초기화
			wari.value = 1; // 와리수 초기화
		}
	
		document.getElementById("p_start").onclick = async function(){

			if (age.value > 45) {
				alert("최대 나이는 45세입니다.")
			} else if (spec.filter(elt => elt.selectedIndex>0).length>1) {
				alert("특화는 한가지만 선택할 수 있습니다.");
			} else {
				var specMarker = -1;
				var specLevel = "";
				var drillMarker = -1;
				if (spec.filter(elt => elt.selectedIndex>0).length==1) {
					specMarker = spec.indexOf(spec.filter(elt =>elt.selectedIndex>0)[0]);
					specLevel = spec.filter(elt =>elt.selectedIndex>0)[0].value;
				}
				if (specLevel == "S" && age.value >35) {
					alert("부스터는 35세까지만 가능합니다.")
				} else {
					for (let i=0; i<8; i++) {
						if (drill[i].checked) {
							drillMarker = i;
							break;
						}
					}
					var oldData = new Object();
					oldData.stat = [];
					for (let i=0; i<8; i++) {
						oldData.stat.push(Number(stat[i].value*10000));
					}
					oldData.bp = "P";
					oldData.level = level.innerText;
					oldData.perc = perc.innerText;
					oldData.age = Number(age.value);
					oldData.wari = Number(wari.value);
					oldData.specMarker = specMarker;
					oldData.specLevel = specLevel;
					oldData.drillMarker = drillMarker;
					p_statArray.push(oldData);

					var tdArray = [
						{"text":oldData.age}, // 나이
						{"text":oldData.wari+"모"}, // 와리
						{"text":(specMarker!=-1?specNameInfoKor[oldData.bp][oldData.specMarker] + " " + oldData.specLevel:"-")}, // 특화
						{"text":(drillMarker!=-1?specNameInfoKor[oldData.bp][oldData.drillMarker]:"-")} // 일훈
					]
					var newRow = makeRow(tdArray);
					log.children[1].appendChild(newRow);

					var newData = JSON.parse(JSON.stringify(oldData));
					for (let i=0; i<119; i++) {
						newData = await oneGameGrowth(newData,i,119);
					}
					for (let i=0; i<8; i++) {
						stat[i].value = (newData.stat[i]/10000).toFixed(2);
					}
					level.innerText = getLevelPerc(newData.stat,"P").level;
					perc.innerText = getLevelPerc(newData.stat,"P").perc;
					age.value = Number(age.value) +1;
					p_savedStatNum ++;
				}
			}
		}

		document.getElementById("p_update").onclick = function() {
			var currStatArray = [];
			for (i=0; i<8; i++) {
				currStatArray.push(stat[i].value*10000);
			}
			level.innerText = getLevelPerc(currStatArray,"P").level;
			perc.innerText = getLevelPerc(currStatArray,"P").perc;
		}

		document.getElementById("p_advanced").onclick = function(){
			var statArray = [];
			for (i=0; i<8; i++) {
				statArray.push(stat[i].value*10000);
			}
			document.getElementById("basicPitcherGrowthBtn").classList.toggle('on',false);
			document.getElementById("basicPitcherGrowth").classList.toggle('on',false);
			document.getElementById("detailPitcherGrowthBtn").classList.toggle('on',true);
			document.getElementById("detailPitcherGrowth").classList.toggle('on',true);
			p_calculateStatAdvanced(statArray,age.value,true);
		}
	}

	function p_calculateStatAdvanced(initStatArray,initAge,initStatGiven) { // 투수 상세육성

		var drill = document.getElementsByName("p_adv_drill");
		var specArray = [];
		for (i=0; i<4; i++) {
			specArray.push(Array.from(document.getElementsByName("p_adv_spec_"+i)))
		}

		for (let i = 0; i<8; i++){
			drill[i].checked = false;
			for (let j=0; j<4; j++) {
				specArray[j][i].innerHTML = "<option>-</option>"
				for (let level of pitcherSpecLevelArray) {
					specArray[j][i].innerHTML += "<option>"+level+"</option>";
				}
				specArray[j][i].selectedIndex = 0;
			}
		} // 일훈, 특화 초기화 (항상)

		var stat = document.getElementsByName("p_adv_stat");
		stat = Array.from(stat);

		var level = document.getElementById("p_adv_level");
		var perc = document.getElementById("p_adv_perc");

		var age = document.getElementById("p_adv_age");
		var wari = document.getElementById("p_adv_war");

		function setWari (wariValue) {
			wari.value = wariValue;
			for (let i=0; i<8; i++) {
				for (let j=0; j<4;j++) {
					specArray[j][i].disabled = !(j<wari.value) || (i==5) || (i==7)
				}
			}
		}

		wari.onchange = function () {
			setWari (wari.value);
		}

		setWari(1);

		var log = document.getElementById("p_adv_log");

		if(initStatGiven) {
			for (let i=0; i<8; i++) {
				stat[i].value = (initStatArray[i]/10000).toFixed(2);
			}
			level.innerText = getLevelPerc(initStatArray,"P").level;
			perc.innerText = getLevelPerc(initStatArray,"P").perc;
			age.value = initAge;
			setWari(1);
			initTable(log);
			p_adv_statArray.length = 0;
			p_adv_savedStatNum = 0;
			// 넘어온 스탯으로 설정 및 기록 초기화
		}

		document.getElementById("p_adv_undo").onclick = function(){
			if(p_adv_savedStatNum>0){
				for (let i=0; i<8; i++) {
					stat[i].value = (p_adv_statArray[p_adv_savedStatNum-1].stat[i]/10000).toFixed(2);
					drill[i].checked = (i==p_adv_statArray[p_adv_savedStatNum-1].drillMarker);
					for (let j=0; j<4; j++) {
						specArray[j][i].selectedIndex = (i==p_adv_statArray[p_adv_savedStatNum-1].specMarkerArray[j] ? specLevelInfo[p_adv_statArray[p_adv_savedStatNum-1].specLevelArray[j]]:0);
					}
				}
				level.innerText = p_adv_statArray[p_adv_savedStatNum-1].level;
				perc.innerText = p_adv_statArray[p_adv_savedStatNum-1].perc;
				setWari(p_adv_statArray[p_adv_savedStatNum-1].wari);
				age.value = p_adv_statArray[p_adv_savedStatNum-1].age;
				log.getElementsByTagName("tbody")[0].deleteRow(p_adv_savedStatNum-1);
				p_adv_savedStatNum--;
				p_adv_statArray.length = p_adv_savedStatNum;
			}
			else{
				alert("저장된 데이터가 없습니다!");
			}
		}

		document.getElementById("p_adv_reset").onclick = function(){
			p_adv_statArray.length = 0;
			p_adv_savedStatNum = 0;
			for (let i=0;i<8; i++) {
				stat[i].value = 99.99;
			}
			level.innerText = 10;
			perc.innerText = 99;
			age.value = 18;
			setWari(1);
			initTable(log);
		}

		document.getElementById("p_adv_start").onclick = async function(){

			if (age.value > 45) {
				alert("최대 나이는 45세입니다.")
			} else if (specArray[0].filter(elt => elt.selectedIndex>0).length>1 || specArray[1].filter(elt => elt.selectedIndex>0).length>1 || specArray[2].filter(elt => elt.selectedIndex>0).length>1 || specArray[3].filter(elt => elt.selectedIndex>0).length>1) {
				alert("특화는 각각 한가지씩만 선택할 수 있습니다.");
			} else {
				var specMarkerArray = [-1,-1,-1,-1];
				var specLevelArray = ["","","",""];
				var drillMarker = -1;
				for (let j=0; j<4; j++) {
					if (specArray[j].filter(elt => elt.selectedIndex>0).length==1) {
						specMarkerArray[j] = specArray[j].indexOf(specArray[j].filter(elt =>elt.selectedIndex>0)[0]);
						specLevelArray[j] = specArray[j].filter(elt =>elt.selectedIndex>0)[0].value;
					}
				}
				var val = false;
				if (age.value < 36) {
					val = true;
				} else {
					val = true;
					for (let j=0; j<4; j++) {
						if (wari.value > j  && specLevelArray[j] == "S") {
							val = false;
							break;
						}
					}
				}
				if (!val) {
					alert("부스터는 35세까지만 가능합니다.")
				} else {
					for (let i=0; i<8; i++) {
						if (drill[i].checked) {
							drillMarker = i;
							break;
						}
					}
					var oldData = new Object();
					oldData.stat = [];
					for (let i=0; i<8; i++) {
						oldData.stat.push(Number(stat[i].value*10000));
					}
					oldData.bp = "P";
					oldData.level = level.innerText;
					oldData.perc = perc.innerText;
					oldData.age = Number(age.value);
					oldData.wari = Number(wari.value);
					oldData.specMarkerArray = specMarkerArray;
					oldData.specLevelArray = specLevelArray;
					oldData.drillMarker = drillMarker;

					p_adv_statArray.push(oldData);

					var newRow = document.createElement("tr");
					var tdArray = [
						{"text":oldData.age}, // 나이
						{"text":oldData.wari+"모"}, // 와리
						{"text":(wari.value>0 && specMarkerArray[0]!=-1?specNameInfoKor[oldData.bp][oldData.specMarkerArray[0]] + " " + oldData.specLevelArray[0]:"-")}, // 특화
						{"text":(wari.value>1 && specMarkerArray[1]!=-1?specNameInfoKor[oldData.bp][oldData.specMarkerArray[1]] + " " + oldData.specLevelArray[1]:"-")}, // 특화
						{"text":(wari.value>2 && specMarkerArray[2]!=-1?specNameInfoKor[oldData.bp][oldData.specMarkerArray[2]] + " " + oldData.specLevelArray[2]:"-")}, // 특화
						{"text":(wari.value>3 && specMarkerArray[3]!=-1?specNameInfoKor[oldData.bp][oldData.specMarkerArray[3]] + " " + oldData.specLevelArray[3]:"-")}, // 특화
						{"text":(drillMarker!=-1?specNameInfoKor[oldData.bp][oldData.drillMarker]:"-")} // 일훈
					]
					var newRow = makeRow(tdArray);
					log.children[1].appendChild(newRow);

					var newData = JSON.parse(JSON.stringify(oldData));
					for (let j=0; j<4; j++) {
						newData.specMarker = specMarkerArray[j];
						newData.specLevel = specLevelArray[j];
						newData.wari = Math.max(Math.min(1,wari.value-j),0);
						var gameCount = 36 - (j==3)*25;
						for (let i=0; i<gameCount; i++) {
							newData = await oneGameGrowth(newData,i,gameCount);
						}
					}
					for (let i=0; i<8; i++) {
						stat[i].value = (newData.stat[i]/10000).toFixed(2);
					}
					level.innerText = getLevelPerc(newData.stat,"P").level;
					perc.innerText = getLevelPerc(newData.stat,"P").perc;
					age.value = Number(age.value) +1;
					wari.value = oldData.wari;
					p_adv_savedStatNum ++;
				}
			}
		}

		document.getElementById("p_adv_update").onclick = function() {
			var currStatArray = [];
			for (i=0; i<8; i++) {
				currStatArray.push(stat[i].value*10000);
			}
			level.innerText = getLevelPerc(currStatArray,"P").level;
			perc.innerText = getLevelPerc(currStatArray,"P").perc;
		}

		document.getElementById("p_basic").onclick = function(){
			var statArray = [];
			for (i=0; i<8; i++) {
				statArray.push(stat[i].value*10000);
			}
			document.getElementById("basicPitcherGrowthBtn").classList.toggle('on',true);
			document.getElementById("basicPitcherGrowth").classList.toggle('on',true);
			document.getElementById("detailPitcherGrowthBtn").classList.toggle('on',false);
			document.getElementById("detailPitcherGrowth").classList.toggle('on',false);
			p_calculateStat(statArray,age.value,true);
		}
	}

	// 투수 육성 끝

	document.getElementById('batterPanelBtn').onclick = function() {
		document.getElementById('batterPanelBtn').classList.toggle('on',true);
		document.getElementById('batterPanel').classList.toggle('on',true);
		document.getElementById('pitcherPanelBtn').classList.toggle('on',false);
		document.getElementById('pitcherPanel').classList.toggle('on',false);
	}

	document.getElementById('pitcherPanelBtn').onclick = function() {
		document.getElementById('pitcherPanelBtn').classList.toggle('on',true);
		document.getElementById('pitcherPanel').classList.toggle('on',true);
		document.getElementById('batterPanelBtn').classList.toggle('on',false);
		document.getElementById('batterPanel').classList.toggle('on',false);
	}

	async function showPlayers() {
		setTimeout(function() {systemText("포지션별 선수 목록을 불러오는 중입니다.");}, 500);
		for (let btn of buttons) {
			btn.disabled = true;
		}
		var batterCards = Array.from(document.getElementsByClassName('batterCard'));
		var pitcherCards = Array.from(document.getElementsByClassName('pitcherCard'));
		for (let card of batterCards.concat(pitcherCards)) {
			card.getElementsByClassName('playerSelect')[0].innerHTML = '<option value="0" class="playerSelectOption">-</option>';
			fillPlayerCard(card,0);
		}

		var allPlayerData = await jQuery.getJSON('https://ya9.naver.com/gmc/teamallplayers.nhn');
		var getPlayerButtons = Array.from(document.getElementsByClassName('getPlayerButton'));
		for (let batter of allPlayerData.batters) {
			batter = addDetail(batter,false);
			for (let card of batterCards) {
				if (card.getAttribute('data-value') == "DH" || card.getAttribute('data-value') == batter.main_pos_cd) {
					card.getElementsByClassName('playerSelect')[0].innerHTML += "<option value='" + batter.plr_no + "' class='playerSelectOption'>" + batter.fullName + " (Lv" + batter.lv + ")" + "</option>";
				}
			}
		}
		for (let pitcher of allPlayerData.pitchers) {
			pitcher = addDetail(pitcher,false);
			for (let card of pitcherCards) {
				card.getElementsByClassName('playerSelect')[0].innerHTML += "<option value='" + pitcher.plr_no + "' class='playerSelectOption'>" + pitcher.fullName + " (Lv" + pitcher.lv + ")" + "</option>";
			}
		}

		for (let btn of buttons) {
			btn.disabled = false;
		}
		systemText("선수 목록 불러오기가 완료되었습니다.");

		for (let btn of getPlayerButtons) {
			btn.onclick = async function () {
				await fillPlayerCard(document.getElementById('playerCard_'+this.value),document.getElementById('playerSelect_'+this.value).value)
			}
		}
	}

	async function fillPlayerCard(card,playerNo) {
		if (playerNo == 0) {
			card.getElementsByTagName('img')[0].setAttribute('style','display: none;');
			card.getElementsByTagName('img')[1].setAttribute('style','display: none;');
			card.getElementsByTagName('img')[2].setAttribute('style','display: none;');
			card.getElementsByClassName('playerStat')[0].innerHTML = '';
		} else {
			var newPlayer = await jQuery.getJSON('https://ya9.naver.com/gmc/playerstatboxdata.nhn?no=' + playerNo);
			var player = addDetail(newPlayer,true);
			card.getElementsByTagName('img')[0].setAttribute('src','/images/breakLimit_'+player.brk_limt_lv+'.png');
			card.getElementsByTagName('img')[1].setAttribute('src','/images/grade_'+player.plr_grd_tp_cd + '.png');
			card.getElementsByTagName('img')[2].setAttribute('src','https://images.ya9.toastoven.net/baseball/ko/img_g/data/player/'+player.plr_img_nm);
			var statTable = card.getElementsByClassName('playerStat')[0];
			statTable.innerHTML = '';
			var tdArray = [
				{"text":player.batr_pitr_tp_cd == "B"?'정확':'구속', "style":"font-size:9px;"},
				{"text":player.ablty_full[0], "style":"color:"+statColor(player.ablty_full[0])},
				{"text":player.batr_pitr_tp_cd == "B"?'파워':'구위', "style":"font-size:9px;"},
				{"text":player.ablty_full[1], "style":"color:"+statColor(player.ablty_full[1])}
			];
			statTable.appendChild(makeRow(tdArray));
			tdArray = [
				{"text":player.batr_pitr_tp_cd == "B"?'선구':'변화', "style":"font-size:9px;"},
				{"text":player.ablty_full[2], "style":"color:"+statColor(player.ablty_full[2])},
				{"text":player.batr_pitr_tp_cd == "B"?'주력':'제구', "style":"font-size:9px;"},
				{"text":player.ablty_full[3], "style":"color:"+statColor(player.ablty_full[3])}
			];
			statTable.appendChild(makeRow(tdArray));
			tdArray = [
				{"text":"체력", "style":"font-size:9px;"},
				{"text":player.ablty_full[4], "style":"color:"+statColor(player.ablty_full[4])},
				{"text":"건강", "style":"font-size:9px;"},
				{"text":player.ablty_full[5], "style":"color:"+statColor(player.ablty_full[5])}
			];
			statTable.appendChild(makeRow(tdArray));
			tdArray = [
				{"text":"정신", "style":"font-size:9px;"},
				{"text":player.ablty_full[6], "style":"color:"+statColor(player.ablty_full[6])},
				{"text":"수비", "style":"font-size:9px;"},
				{"text":player.ablty_full[7], "style":"color:"+statColor(player.ablty_full[7])}
			];
			statTable.appendChild(makeRow(tdArray));
			card.getElementsByTagName('img')[0].setAttribute('style','');
			card.getElementsByTagName('img')[1].setAttribute('style','');
			card.getElementsByTagName('img')[2].setAttribute('style','');
		}
	}

}

window.onload = main;