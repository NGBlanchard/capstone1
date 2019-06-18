'use strict';

const bothData = [];
const referName = [];
const finalSearch = [];
const getURL = "https://rxnav.nlm.nih.gov/REST/drugs.json?name="
const interactionURL = "https://rxnav.nlm.nih.gov/REST/interaction/list.json?rxcuis=";

//retrieves data from API based on search term
function getRxcui(searchTerm) {
  $('#js-error-message').empty();
  $('#js-search-term').val("");
  fetch(getURL + searchTerm)
   .then(response => response.json())
  .then(responseJson => legitName(responseJson))
  .catch(error => {
    $('#js-error-message').text(`Something went wrong. Please submit a valid drug name.`);
  });
  }

function legitName(responseJson){
var nameArray =
  responseJson.drugGroup.conceptGroup.filter(conceptGroup => conceptGroup.conceptProperties);
  for (let i = 0; i < nameArray.length; i++){
    if (nameArray[i].conceptProperties){
      sweepData(responseJson);
      }
  else {$('#js-error-message').text(`Something went wrong. Please submit a valid drug name.`)
      }
}
}

//filters data for drug synonym and rxcui
function sweepData(responseJson) {
  var drugArray =
  responseJson.drugGroup.conceptGroup.filter(conceptGroup => conceptGroup.conceptProperties);
  var names = [];
  var rxcuis = [];
  for (let i = 0; i < drugArray.length; i++){
    if (drugArray[i].conceptProperties){
     var drugArray2 = drugArray[i].conceptProperties;
    for (let i = 0; i < drugArray2.length; i++){
      var drugSynonym = drugArray2[i].synonym;
      names.push(drugSynonym);
      var drugRxcui = drugArray2[i].rxcui;
      rxcuis.push(drugRxcui);
      }
    }
  }
  makeNewThing(names, rxcuis); 
}

//combines the drug name and drug rxcui numb er sinto one array of objects and passes that along
function makeNewThing(names, rxcuis){
  var results = names.map((key, index) => ({[key]: rxcuis[index]}));
  const searchData = names.map((el, index) => {
    return {
      [names[index]]: rxcuis[index]
      }
  });
  bothData.push(searchData[0]);
  displayOptions(searchData);
}


//displays synonym options for user to select
  function displayOptions(searchData){
    for (let i = 0; i < searchData.length; i++){
    $('#results-list').append(
       `<li>
          <span class="list-item">${Object.keys(searchData[i])}</span>
          <div class="button-controls">
            <button class="add-item">
            <span class="button-label">+</span>
            </button>
          </div>
       </li>`
     );
    }
  $('#results').removeClass('hidden');
}


//watches for button to add drug to interaction search box
function addDrug(){
  $("#results-list").on("click", ".add-item", function(event) {
  let newEntry = $(event.currentTarget).closest('li').find('.list-item').text();
  referName.push(newEntry);
  displayInteractionBox(newEntry);
  getGroup();
});
}

//displays the interaction search box
function displayInteractionBox(newEntry) {
  //console.log(newEntry);
  $("#interaction-box").append(`<li class="interaction-list">${newEntry} <div class="button-controls">
  <button class="delete-item">
  <span class="button-label">-</span>
  </button>
</div></li>`);
  $('#interaction-wrapper').removeClass('hidden2');
}


function deleteDrug(){
  $("#interaction-wrapper").on("click", ".delete-item", function(event) {
    $(event.currentTarget).closest('li').remove();
    let deleteEntry = $(event.currentTarget).closest('li').find('.list-item').text();
    // var index = referName.indexOf(deleteEntry);
    // if (index > -1) {
    //   referName.splice(index);
     console.log(referName);
    
});
}

//this will pair the search term with its rxcui
function getGroup() {
  const searchArray = [];
  for (let i = 0; i < bothData.length; i++){searchArray.push(Object.values(bothData[i]))
  ;}
  const semiFinalSearch = searchArray.join("+");
  finalSearch.push(semiFinalSearch);
  // var name = referName.toString();
}

function watchBox() {
  $("#interaction-wrapper").on("click", ".get", function(event) {
    event.preventDefault();
    $('#results-list').empty();
    $('.list-title').empty();
    finalFetch();
  });
}

//fetch for drug interaction
function finalFetch(){
  var finalInteractionURL = interactionURL + finalSearch[finalSearch.length-1];
  //console.log(finalInteractionURL);
  fetch(finalInteractionURL)
  .then(response => response.json())
  .then(responseJson2 => displayInteractions(responseJson2))
  .catch(error => $('#js-error-message').text(`Something went wrong. Please add more drugs.`));
}

//displays the interactions between drugs in the list of added drugs
function displayInteractions(responseJson2){
  $('#results-list').empty();
  $('.list-title').empty();
  for (let i = 0; i < responseJson2.fullInteractionTypeGroup.length; i++){
    var finalData = responseJson2.fullInteractionTypeGroup[i].fullInteractionType
    
  for (let i = 0; i < finalData.length; i++) {
      var finalData1 = finalData[i].interactionPair
      
  for (let i = 0; i < finalData1.length; i++){
      var finalData2 = finalData1[i].description
      
  $('#results-list').append(
       `<li>
          ${finalData2}
       </li>`
      );
      }
    }
  }
}


//watches the form for search button
function watchForm() {
  $('form').submit(event => {
    event.preventDefault();
    const searchTerm = $('#js-search-term').val();
    $('#results-list').empty();
    $('.list-title').empty();
    getRxcui(searchTerm);
    $('.list-title').append(`Results for ${searchTerm}`);
  });
}

function restart(){
  $("#interaction-wrapper").on("click", ".restart", function(event) {
    event.preventDefault();
    $('#results-list').empty();
    $('.list-title').empty();
    $("#interaction-box").empty();
    $("#js-error-message").empty();
    bothData.length = 0;
    referName.length = 0;
    finalSearch.length = 0;
    $('#interaction-wrapper').toggleClass('hidden2');
});
}

//call stack :)
$(watchForm);
$(addDrug);
$(watchBox);
$(deleteDrug);
$(restart);