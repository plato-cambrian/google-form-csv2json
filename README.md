google-form-csv2json
====================

This script parses a CSV results file from a Google Form into json.
There's also a webpage included that renders some D3 charts using this json.

I wrote this tool after someone spammed a google form with thousands of fake
replies. Google's nice Response Summary page does not update its charts after
removing the fake replies, so I needed a way to view the cleaned results. I
saved the chart results as CSV and wrote this script to process them.

If you want to use this to display results of your own google forms survey, you
should run `node js/node-makeJson.js your/file.csv` and then change
`js/renderJson.js` to point to the right JSON.

Unfortunately, google forms csv export does not include metadata about question
type (multiple choice, range, freeform.) You just get a list of answer strings.
`renderJson.js` assumes that any question with more than 7 unique answers is a
free-form text question; and every other question is multiple choice.

Usage
----

    $ npm start
    $ firefox localhost:8000

You will see d3js charts representing results of a BRAVE Leadership survey.

Notes
-----

This is using a development version of the NVD3 library.
This is the exact file version: 
https://github.com/novus/nvd3/blob/b5e766d681a2c4887cadcdd2f01a38b693a770f4/nv.d3.min.js
Similarly, this is the NVD3 css file:
https://github.com/novus/nvd3/blob/b5e766d681a2c4887cadcdd2f01a38b693a770f4/nv.d3.css

I'll update the NVD3 dependency when NVD3 releases a 2.x tag on their Git repo.
