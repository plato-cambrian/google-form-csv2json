// This expects a json file structured like the following.
// Create this json file by running:
// node js/node-makeJson.js data/yourGoogleFormsCSVFile.csv

/*
  {
    qIndex:["Question 1 Title", "Question 2 Title"...],
    byQuestions: {
      "Question 1 Title": {
        answers: ["Foo", "Bar", "Foo"...]
      },
      "Question 2 Title": {
        answers: ["You Suck", "Bar", "Who wrote these shitty questions"...]
      }
      ...
    },
    byResponse: [
      ["Foo", "You Suck", ...],
      ["Bar", "Bar", ...],
      ...
    ]
  }
*/
var SURVEY_JSON_SRC = '../data/brave-c3i-members.csv.json';

// Unfortunately Google Forms doesn't give clues about question type.
// On this leadership survey, the most possible choices for multiple choice
// questions is 6 (plus the possibility of an empty string for no answer). Any
// question that has more than 7 unique answers is assumed to be a freeform text
// answer.
var MAX_CHOICES = 7; 

// Polyfill to ensure proper counting of object keys:
if (!Object.keys) {
  Object.keys = function (obj) {
    var keys = [],
      k;
    for (k in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, k)) {
        keys.push(k);
      }
    }
    return keys;
  };
}

// Global `survey` object that contains multiple models of the survey results. see top
var survey = {};

// Global `summaries` array that contains question text, answers,
// and answer count summaries:
var summaries = [];

$(document).ready(init);

function init(){
  $.getJSON(SURVEY_JSON_SRC, function(data){
    survey = data;
    console.log("Accumulating summaries");
    console.log(survey);
    summaries = accumulateSummaries(survey); // this tallies up identical responses
    console.log("Rendering summeries");
    console.log(summaries);
    renderSurvey(summaries);
  })
  .fail(renderFail);
};

function renderFail(){
  var msg = "Problem loading the json file. If you're loading from file:// in chrome, do npm start and load localhost:8000 instead."
  $('#summary"').append($('<span></span>').text(msg));
  console.log(msg);
};

function accumulateSummaries(survey){
  // This function processes the json data that was converted from csv.
  // The goal is to create a summaries array that contains question objects,
  // each with properties question, answers, summaryObj, summaryArr

  // byQs is an object where keys=question text; values = array of answers:
  var byQs = survey.byQuestion; 

  // Make a new array to store our WIP questions while processing. It's easier
  // than trying to manipulate the byQs object.
  var qList = [];
  for(q in byQs){
    if(byQs.hasOwnProperty(q)){
      qList.push({
        question: q, 
        answers: byQs[q],
        summaryObj: {},
        summaryArr: [],
      });
    };
  };

  // Values in qList now have text and answers properties, but the answers array
  // may have many duplicates e.g. "Yes" "Yes "No"

  // We will use array.reduce to look at each answer, one by one,
  // counting up the total appearances of each answer for that question.

      function reducer(summary, answer, j, arr){
        // This one iteration will increment the value of summary[answer].
        // The end result after each element is reduced will be e.g. {"Yes": 10, "No": 12}.
        
        // In case an answer was left blank, substitute N/A for better readability:
        if(answer === ""){ 
          answer = "N/A"
        }

        // Increment the count summary for this answer:
        if(summary[answer] === undefined){ // Never before seen this answer to this question
          summary[answer] = 1; // Now we've seen one
        } else {
          summary[answer] += 1; // We've seen one more
        }
        return summary;
      }

      // After accumulating an object counting the answers, we will transform it
      // into an array: [{a: "Yes", n: 10}, {a: "No", n: 12}, ... ]
      function flattenSummaryObject(summaryObj){
        var summaryArr = [];
        for(a in summaryObj){
          if(summaryObj.hasOwnProperty(a)){
            summaryArr.push({
              a: a,
              n: summaryObj[a],
            });
          };
        };
        return summaryArr;
      };

  // For each question in qList:
  // Reduce the question's answer list to a summaryObj. Go through summaryObj
  // and create summaryArr. 

  console.log('Before reduction');
  console.log(qList);
  for(var i=0; i < qList.length; i++){
    var thisQ = qList[i];
    var summaryObj = thisQ.answers.reduce(reducer, {});
    thisQ.summaryObj = summaryObj;
    thisQ.summaryArr = flattenSummaryObject(summaryObj);
  };

  console.log('After reduction');
  console.log(qList);
  //summaries = qList; doing this in init()
  return qList;
};

function renderSurvey(summaries){
  // I'm starting the iterator at 1 for this BRAVE leadership survey because it's a
  // really easy way of skipping the first question, which is a timestamp and
  // not worth showing. But I didn't want to process it out of the data in node.
  for(var i=1; i<summaries.length; i++){
    var q = summaries[i];
    console.log(q);
    if(Object.keys(q.summaryObj).length > MAX_CHOICES){
      buildTextCloud(q);
    } else {
      buildChartChoice(q);
    }
  }
};

function buildChartChoice(q){
  var title = $('<h3></h3>').text(q.question);
  $('#summary').append(title);
  var container = $('<div></div>').addClass('container chart-choice');

  var el = $('<pre></pre>').append('<code></code>').text(JSON.stringify(q.summaryArr));

  container.append(el);
  $('#summary').append(container);
}

function buildTextCloud(q){
  var title = $('<h3></h3>').text(q.question);
  $('#summary').append(title);
  var container = $('<div></div>').addClass('container textcloud');
  var el = $('<p></p>');
  for(a in q.summaryObj){
    if(q.summaryObj.hasOwnProperty(a)){
      var length = (a.length > 80 ? "long" : 
                   (a.length > 30 ? "medium" : "short") );
      var txt = $('<span></span>').text(a);
      txt.addClass(length);
      txt.appendTo(el);
    };
  };
  container.append(el);
  $('#summary').append(container);
}
