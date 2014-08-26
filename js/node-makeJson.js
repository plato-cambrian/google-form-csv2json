// This script takes one command line argument, which should be the filename of
// a CSV file sourced from a Google Docs form.
// This script parses the CSV and generates a JSON object `results`.
//
// results.qIndex
// This is an array of the first line of the CSV; which should be the questions.
//
// results.byQuestion
// A object property with a number of string keys. The value of each key is an
// array of answers.
//
// results.byResponse 
// An array property containing a number of child response arrays.
// Each child array is the ordered survey responses from one respondent.

var path = require('path');
var csv = require('csv');
var fs = require('fs');

var byQuestion = {};
var byResponse = {};
var qIndex = [];

var fileArg = process.argv[2];
if(fileArg === undefined){ 
  throw new Error('Pass a csv filename as a command line parameter.');
}

//use fileArg if already absolute path; else assume filename is relative to .
var filePath = path.resolve(fileArg); 

readCSVtoQuestions(function(err){
  if(err){
    return console.log(err);
  };
  readCSVtoResponses(function(err){
    if(err){
      return console.log(err);
    };

    var out = {
      byQuestion: byQuestion,
      byResponse: byResponse,
      qIndex: qIndex,
    };
    console.log('Writing json output to '+filePath+'.json');
    fs.writeFileSync(filePath+'.json', JSON.stringify(out));
  });
});

function readCSVtoQuestions(callback){
  //Load the CSV twice. The first time for byQuestions and we use the 'columns'
  //to get an object. The second time is for byResponses and we just get an
  //array without the questions.

  // The presence of the columns argument tells csv whether to read the rows as
  // an object with keys or as a flat array.

  var errorHappened = false; // flag to avoid calling back twice

  csv()
  .from(filePath, {columns: true})
  .to.array(function(data, count){
    console.log(data.length+' records loaded');
  })
  .transform(function(row, index){
    // copy each answer in this response into byQuestion[name] array
    for (var name in row) {
      var value = row[name];
      if(row.hasOwnProperty(name)){
        byQuestion[name] = byQuestion[name] || [];
        byQuestion[name].push(value);
      };
    };
    return row;
  })
  .on('error', function(err){
    errorHappened = true;
    return callback(err);
  })
  .on('end', function(count){
    if(!errorHappened){
      return callback(null);
    };
  });
}

function readCSVtoResponses(callback){
  // Read CSV a second time, this time as an array
  var errorHappened = false; // flag to avoid calling back twice
  csv()
  .from(filePath)
  .to.array(function(data, count){
    console.log(data.length+' records loaded');
    byResponse = data;
  })
  .transform(function(row, index){
    if(index===0){ // Skip header and save it to a global variable
      qIndex = row;
      return null;
    } else {
      return row;
    }
  })
  .on('error', function(err){
    errorHappened = true;
    return callback(err);
  })
  .on('end', function(count){
    if(!errorHappened){
      return callback(null);
    };
  });

};
