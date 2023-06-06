let LANG = {
  reset: 'Already choose public cards, click reset button to reset',
  hand: 'Please choose 2 hand cards!',
  pub: 'Please choose 0~4 public public cards',
  player: 'Player',
  hc: 'Hand cards',
  pc: 'Public cards',
  more: 'Please select 2 or more players!',
  de: '\'s'
}
const RANDOMTIMES = 10000
const SUITS = ['spade', 'heart', 'club', 'diamond']
const VALUES = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2']
const allCards = arrayMultiply(SUITS, VALUES)
let playerCount = 0
let handCards = []
let publicCards = []
let winRecords = []
let winRates = []

let remainingPossibilities = []
let leftCards = []
let iterations = 0;
let count = 0;
let picked = new Map();
let stopCal = 0;

// use var instead of let, because of a bug in safari:
// let someID = document.getElementById('someID') will throw an error
var chosen = id('chosen')
var info = id('info')
var handButton = id('chooseHandCards')
var pubButton = id('public')
var calcButton = id('calc')
var resetButton = id('reset')
var pokers = document.querySelectorAll('.container .poker')
var process = id('process')
var processResult = 0;
// 獲取反超張數和牌堆剩餘數的輸入元素
var counterInput = id("counter");
var deckInput = id("deck");
var counterNum = id("counterNum");
var deckNum = id("deckNum");

handButton.addEventListener('click', function () {
  let selectedPokers = document.querySelectorAll('.container .selected')
  if (selectedPokers.length !== 2) {
    // alert('Please choose 2 hand cards!')
    alert(LANG.hand)
  } else {
    let s = '<div class="cards">'
    let hc = []
    for (let i = 0; i < selectedPokers.length; i++) {
      hc.push(selectedPokers[i].id.split('_'))
      selectedPokers[i].classList.remove('selected')
      s += selectedPokers[i].outerHTML
    }
    handCards.push(hc)
    s += '<span> ' + LANG.player + ' ' +
    (playerCount + 1) + ' ' + LANG.de +
    LANG.hc;
	s += '</span><button class="delete-btn" onclick="editHandCard(event)">' + LANG.edit + '</button>'
	s += '</span><button class="delete-btn" onclick="deleteHandCard(event)">' + LANG.del + '</button><hr /></div>'
    playerCount += 1
    chosen.innerHTML += s
  }
  stopCalculate();
})

function stopCalculate(){
	info.innerHTML = '';
	stopCal = 1;
}

function editHandCard(event) {
  let cardContainer = event.target.parentNode
  let pubContainer = id("pub")
  let index = Array.from(chosen.children).indexOf(cardContainer)
  let pubIndex = Array.from(chosen.children).indexOf(pubContainer)
  console.log(pubIndex);
  if (index > pubIndex){
	index--;
  }
  handCard = handCards[index]
  //console.log(handCard)
  for(let i = 0; i< handCard[index].length; i++){
	  //console.log(handCard[i][0] + '_' + handCard[i][1])
	  card = document.getElementById(handCard[i][0] + '_' + handCard[i][1])
	  //console.log(card)
	  card.click()
  }
  handCards.splice(index, 1)
  cardContainer.remove()
  stopCalculate();
}

function deleteHandCard(event) {
  let cardContainer = event.target.parentNode
  let index = Array.from(chosen.children).indexOf(cardContainer)
  handCards.splice(index, 1)
  cardContainer.remove()
  stopCalculate();
}

pubButton.addEventListener('click', function () {
  let selectedPokers = document.querySelectorAll('.container .selected')
  let slen = selectedPokers.length
  if (publicCards.length) {
    // alert('Already choose public cards, click reset button to reset')
    alert(LANG.reset)
  } else if (slen >= 5) {
    // alert('Please choose 0~4 public public cards')
    alert(LANG.pub)
  } else {
    if (slen === 0) return;
    let s = '<div id="pub" class="cards">'
    for (let i = 0; i < slen; i++) {
      publicCards.push(selectedPokers[i].id.split('_'))
      selectedPokers[i].classList.remove('selected')
      s += selectedPokers[i].outerHTML
    }
    s += '<span> ' + LANG.pc + '</span>'
	s += '<button class="delete-btn" onclick="editPublicCard(event)">' + LANG.edit + '</button></span>'
	s += '<button class="delete-btn" onclick="deletePublicCard(event)">' + LANG.del + '</button><hr /></div>'
    chosen.innerHTML += s
	stopCalculate();
  }
})

function editPublicCard(event) {
  for(let i = 0; i< publicCards.length; i++){
	  //console.log(publicCards[i][0] + '_' + publicCards[i][1])
	  card = document.getElementById(publicCards[i][0] + '_' + publicCards[i][1])
	  //console.log(card)
	  card.click()
  }
  deletePublicCard(event); 
  stopCalculate();
}

function deletePublicCard(event) {
  let cardContainer = event.target.parentNode
  let index = Array.from(chosen.children).indexOf(cardContainer)
  publicCards = []
  cardContainer.remove();
  stopCalculate();
}

calcButton.addEventListener('click', function () {
  if (handCards.length < 2) {
    // alert('Please select 2 or more players!')
    alert(LANG.more)
  } else {
    calcButton.disabled = 'true'
    setTimeout(function () {		
      calculate()
      showResult()
    }, 100)
  }
})

function showResult() {
  let s = '';
  for (let i = 0; i < winRecords.length; i++) {
    s += '<tr><td>' + (i + 1) + '</td><td>' +
    toPercent(winRates[i]) + '</td></tr>';
  }
  info.innerHTML = s;
  calcButton.disabled = '';
  updateProgressBar(processResult);
  
  
}

resetButton.addEventListener('click', function () {
  winRecords = [0, 0, 0]
  playerCount = 0
  handCards = []
  publicCards = []
  chosen.innerHTML = ''
  info.innerHTML = ''
  let scards = document.getElementsByClassName('selected')
  scards = Array.prototype.slice.call(scards)
  for (let i = 0; i < scards.length; i++) {
    scards[i].classList.remove('selected')
  }
    stopCalculate();
})
  
window.onload = function () {
  for (let i = 0; i < pokers.length; i++) {
    pokers[i].onclick = triggerSelected(i)
  }
  updateResult();
}

function triggerSelected (i) {
  return function () {
    pokers[i].classList.toggle('selected')
  }
}


function calculate () {
  stopCal = 0;
  winRecords = Array(handCards.length).fill(0)
  let allSelectedCards = []

  for (let i = 0; i < handCards.length; i++) {
    for (let j = 0; j < handCards[i].length; j++) {
      allSelectedCards.push(handCards[i][j])
    }
  }

  allSelectedCards = allSelectedCards.concat(publicCards)
  leftCards = arrayWithout(myConcat(allCards), myConcat(allSelectedCards))
  let short = 5 - publicCards.length
  let possibilities = combNumber(leftCards.length, short)
  // console.log(leftCards.length, short, possibilities)


  if (possibilities < RANDOMTIMES) {
	processResult = 100
    let indexes = Array(leftCards.length).fill(0).map((v, i) => i)
    let combs = combination(indexes, short)
    for (let i = 0; i < combs.length; i++) {
      let addedCards = [].concat(publicCards)
      combs[i].forEach(v => addedCards.push(leftCards[v].split('_')))
      let winners = whoWin(addedCards, handCards)
      winners.forEach(v => winRecords[v] += 1/winners.length)
    }
    winRates = winRecords.map(v => (v / possibilities).toPrecision(4))
  } else {
	  console.log('>')
	iterations = Math.ceil(possibilities / RANDOMTIMES); // 计算循环的次数
	remainingPossibilities = possibilities; // 剩余的组合数
	console.log(iterations)
	count = 0;
	picked = new Map();
	setTimeout(loopIteration(),10);
    /*for (let count = 0; count < iterations; count++) {
	  loopIteration(remainingPossibilities, RANDOMTIMES, leftCards, iterations, count);
	}*/
  }
}

function loopIteration(){	
	if(stopCal == 1){
		return;
	}
	let currentRandomTimes = Math.min(remainingPossibilities, RANDOMTIMES); // 当前循环的随机次数
	  remainingPossibilities -= currentRandomTimes; // 更新剩余的组合数

	  let winRecordsTemp = Array(handCards.length).fill(0); // 临时的获胜次数数组

	  for (let i = 0; i < currentRandomTimes; i++) {
		let randomPickedCards = [];
		let publicCardsCopy = publicCards.slice(0);
		let randomPickedNums = randomPick(leftCards.length, 5 - publicCards.length);
		let key = randomPickedNums.sort().join();
		while(picked.get(key) == 1){
			randomPickedNums = randomPick(leftCards.length, 5 - publicCards.length);
			key = randomPickedNums.sort().join();
		}
		picked.set(key, 1)		
		

		for (let j = 0; j < randomPickedNums.length; j++) {
		  randomPickedCards.push(leftCards[randomPickedNums[j]]);
		}

		for (let j = 0; j < randomPickedCards.length; j++) {
		  publicCardsCopy.push(randomPickedCards[j].split('_'));
		}

		let winners = whoWin(publicCardsCopy, handCards);

		for (let j = 0; j < winners.length; j++) {
		  winRecordsTemp[winners[j]] += 1/winners.length;
		  //console.log(winRecordsTemp)
		}
	  }

	  for (let i = 0; i < winRecordsTemp.length; i++) {
		winRecords[i] += winRecordsTemp[i];
	  }

	  //winRates = winRecords.map(v => v / (iterations * RANDOMTIMES)); // 更新获胜概率
	  winRates = winRecords.map(v => v / picked.size); // 更新获胜概率	 
	  count++;
	  console.log(count);
	  processResult = count / iterations * 100;
	  showResult();	  
	  if(count < iterations ){
		  //console.log('again');
		setTimeout(loopIteration,1);
	  }
}


// 输入5张公共牌和所有玩家手牌，输出胜利的玩家(们)的index数组
function whoWin (publicCards, handCards) {
  let combs = combination([0, 1, 2, 3, 4, 5, 6], 5)
  let maxes = Array(handCards.length).fill(0)
  for (let i = 0; i < handCards.length; i++) {
    let sevenCards = publicCards.concat(handCards[i])
    for (let j = 0; j < combs.length; j++) {
      let fiveCards = []
      for (let k = 0; k < combs[j].length; k++) {
        fiveCards.push(sevenCards[combs[j][k]])
      }
      let cardsValue = getCardsValue(fiveCards)
      if (maxes[i] < cardsValue) {
        maxes[i] = cardsValue
      }
    }
  }
  let result = []
  let max = Math.max.apply(null, maxes)
  maxes.map(function (x, i) {
    if (x === max) {
      result.push(i)
    }
  })
  //console.log(result);
  return result
}

// 監聽輸入值變化事件
counterInput.addEventListener("input", updateResult);
deckInput.addEventListener("input", updateResult);

// 更新結果
function updateResult() {
  var counterValue = parseInt(counterInput.value);
  var deckValue = parseInt(deckInput.value);
  
  // 計算可跟注尺吋
  var resultValue = counterValue / (deckValue - 2 * counterValue);
  
  // 更新結果標籤的內容
  var resultLabel = document.getElementById("result");
  resultLabel.textContent = resultValue.toString();
  
  counterNum.innerHTML = counterValue;
  deckNum.innerHTML = deckValue;
}

