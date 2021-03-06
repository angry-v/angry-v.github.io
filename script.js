async function main(){

	var b_savedStatNum = 0;
	var b_adv_savedStatNum = 0;
	var p_savedStatNum = 0;
	var p_adv_savedStatNum = 0;
	let b_statArray = [];
	let b_adv_statArray = [];
	let p_statArray = [];
	let p_adv_statArray = [];
	
	var buttons = document.getElementsByClassName("menuButton");
	buttons = Array.from(buttons);
	var results = document.getElementsByClassName("result");
	results = Array.from(results);

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
	const specNameInfoKor = {
		"B":["정확","파워","선구","주력","체력","건강","정신","수비"],
		"P":["구속","구위","변화","제구","체력","건강","정신","수비"]
	}
	const specLevelInfo = {
		"S":1,"A":2,"B":3,"C":4,"D":5
	}
	const batterSpecLevelArray = ["S","A","B","C","D"];
	const pitcherSpecLevelArray = ["S","A"];

	var addStatInfo = await jQuery.getJSON("addStatInfo.json");

	const tabArray = [ // 반드시 탭 순서대로 넣을 것
		document.getElementById("home"),
		document.getElementById("batterGrowthCalc"),
		document.getElementById("pitcherGrowthCalc")
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
				case "batterBtn": // 타자육성
					b_calculateStatAdvanced([],false);
					break;
				case "pitcherBtn": // 투수육성
					p_calculateStatAdvanced([],false);
					break;
			}
		}
	}

	// 타자 육성 시작

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
	}

	// 투수 육성 끝
}

window.onload = main;