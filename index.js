'use strict';

const bothData = [];
const searchArray = [];
const finalSearch = [];
const getURL = "https://rxnav.nlm.nih.gov/REST/drugs.json?name="
const interactionURL = "https://rxnav.nlm.nih.gov/REST/interaction/list.json?rxcuis=";

//retrieves data from API based on search term
function getRxcui(searchTerm) {
  $('#js-error-message').empty();
  $('#js-search-term').val("");
  fetch(getURL + searchTerm)
  .then(response => response.json())
  .then(responseJson => sweepData(responseJson))
  .catch(error => {
    $('#js-error-message').text(`Something went wrong. Please submit a valid drug name.`);
    $('.list-title').empty();
  });
  }

//filters data for drug synonym and rxcui
function sweepData(responseJson) {
  const drugArray2 = [];
  const drugArray = responseJson.drugGroup.conceptGroup;
  for (let i = 0; i < drugArray.length; i++){
    if (drugArray[i].conceptProperties){
     drugArray2.push(drugArray[i].conceptProperties);}}
  const drugArray3 = [].concat.apply([], drugArray2);
  const names = [];
  for (let i = 0; i < drugArray3.length; i++){
    names.push(drugArray3[i].synonym)};
  const rxcuis = [];
  for (let i = 0; i < drugArray3.length; i++){
    rxcuis.push(drugArray3[i].rxcui)
};
  makeNewThing(names, rxcuis)
}

//combines the drug name and drug rxcui numbers into one array of objects and pushes it to global value, passes the search results along to display function
function makeNewThing(names, rxcuis){
  const searchData = names.map((el, index) => {
    return {
      [names[index]]: rxcuis[index]
      }
  });
  const dino = Object.assign(...names.map((k, i) => ({[k]: rxcuis[i]})));
  
  bothData.push(dino);
  displayOptions(searchData);
}


//displays synonym options for user to select
  function displayOptions(searchData){
    for (let i = 0; i < searchData.length; i++) {
    if (Object.keys(searchData[i]) != '') {
    $('#results-list').append(
       `<li>
          <span class="list-item">${Object.keys(searchData[i])}</span>
          <div class="button-controls">
          <div id="check" class="hidden">&#10003;</div>
            <button class="add-item">
            <span class="button-label">+</span>
          </div>
       </li>`
     );
    }}
  $('#results').removeClass('hidden');
}


//watches for button to add drug to interaction search box
function addDrug(){
  $("#results-list").on("click", ".add-item", function(event) {
  let newEntry = $(event.currentTarget).closest('li').find('.list-item').text();
  displayInteractionBox(newEntry);
  getGroup(newEntry);
  $(event.currentTarget).fadeOut("medium");
  $(event.currentTarget).closest('li').find('#check').fadeIn("slow");
});
}

//displays the interaction search box
function displayInteractionBox(newEntry) {
  $("#interaction-box").append(`<li class="interaction-list"><span class="interaction-item">${newEntry}</span><div class="button-controls">
  <button class="delete-item">
  <span class="button-label">-</span>
  </button>
</div></li>`);
  //$('#interaction-wrapper').removeClass('hidden2');
  $("#interaction-wrapper").fadeIn("slow", function() {
    $("#interaction-wrapper").removeClass("hidden2");
});
}



function deleteDrug(){
  $("#interaction-wrapper").on("click", ".delete-item", function(event) {
    $('#results-list').empty();
    $('.list-title').empty();
    $(event.currentTarget).closest('li').fadeOut("medium");
    let deleteEntry = $(event.currentTarget).closest('li').find('.interaction-item').text();
  
  for (let i = 0; i < bothData.length; i++){
    if (bothData[i][deleteEntry]) {
      var plop = bothData[i][deleteEntry];
    }
  }
  var index = searchArray.indexOf(plop);
    if (index > -1) {
    searchArray.splice(index, 1);
    }
  });
}


//this will pair the search term with its rxcui
function getGroup(newEntry) {
  for (let i = 0; i < bothData.length; i++){
    if (bothData[i][newEntry]) {
    searchArray.push(bothData[i][newEntry]);
  }}
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
  const semiFinalSearch = searchArray.join("+");
  finalSearch.push(semiFinalSearch);
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
  var finalData2 = [];
  for (let i = 0; i < responseJson2.fullInteractionTypeGroup.length; i++){
    var finalData = responseJson2.fullInteractionTypeGroup[i].fullInteractionType
  for (let i = 0; i < finalData.length; i++) {
      var finalData1 = finalData[i].interactionPair
      
  for (let i = 0; i < finalData1.length; i++){
      finalData2.push(finalData1[i].description)
      }
    }
  }
  var uniqueData = [];
    $.each(finalData2, function(i, el){
        if($.inArray(el, uniqueData) === -1) uniqueData.push(el);
    });
  for (let i = 0; i < uniqueData.length; i++){  
    $('#results-list').append(
        `<li class="interact">
            ${uniqueData[i]}
        </li>`
    );
  }
}


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
    searchArray.length = 0;
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