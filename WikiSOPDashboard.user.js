// ==UserScript==
// @name         WikiSOPDashboard
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Simple Dashboard for SOP wiki
// @author       @salazar
// @match        https://w.amazon.com/bin/view/AdServerCreativeSupport/Internal/Tools/WikiSOPDashboard*
// @downloadURL	 https://drive.corp.amazon.com/view/Amazon%20Ad%20Server%20Tech%20Support/PROJECTS/Wikisopdashboard/wikiSOPDashboard.user.js
// @updateURL	 https://drive.corp.amazon.com/view/Amazon%20Ad%20Server%20Tech%20Support/PROJECTS/Wikisopdashboard/wikiSOPDashboard.user.js
// @require		 https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.5.0/Chart.js
// @require		 https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.4.0/Chart.min.js
// @require      https://unpkg.com/xlsx@0.15.1/dist/xlsx.full.min.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=amazon.com
// @connect      w.amazon.com
// @grant        GM_xmlhttpRequest
// @grant        none

// ==/UserScript==

if (typeof jqueryize == 'undefined') {

    jqueryize = function(fn) {
        var script1 = document.createElement('script');
        script1.src = "https://cdn.jsdelivr.net/gh/linways/table-to-excel@1.0.4/dist/tableToExcel.js";
       script1.onload = function() {
            var fnScript = document.createElement('script');
            fnScript.textContent = '(' + fn.toString() + ')(jQuery.noConflict(true));';
            document.body.appendChild(fnScript);
        };
        document.body.appendChild(script1);
    }
}

function addJobData($) {
    
    $(".panel-body").html("<div id='wiki-dash-container'></div>");
    $(".wikigeneratedheader").append("<button id='export' title='You can export the table base on the selected tab.'>▼ Export table</button>");
    $("#wiki-dash-container").append("<p id='loader' style='text-align:center;'>Please wait while the minions do their work</p><div id='loading'><center><img src='https://w.amazon.com/resources/icons/xwiki/ajax-loader-large.gif'></img></center></div>");
    $(".panel-title").hide();
    $("strong").hide();
    let datasource = "Internal.Processes.DomainProcesses";
    let datasourcetext = "Domain Processes";
    let date = new Date();
    let datear = date.getDay() + 6;
    let month = date.setDate(date.getDate() - 30);
    let prevmonth = new Date(date.getFullYear(), date.getMonth() - 0, 1);
    let prevmonthend = new Date(date.getFullYear(), date.getMonth() - 0, 30);
    let ell = "Last month";
    let ete = ".dash-tablebody-update";
    $(".wikigeneratedheader").append("<select id='datepicker'><option value='yesterday'>Yesterday</option><option value='today'>Today</option><option value='lastweek'>Last week</option><option selected value='lastmonth'>Last Month</option><option value='thismonth'>This month</option><option value='last7days'>Last 7 days</option><option value='last30days'>Last 30 days</option><option value='custom'>Custom</option></select>");
    $(".wikigeneratedheader").append("<div id='loading'><center><img src='https://w.amazon.com/resources/icons/xwiki/ajax-loader-large.gif'></img></center></div>");
    $(".wikigeneratedheader").hide();
    $("#datepicker").on('change', function() {
        $("#datepickercustom").remove();
        $("#loading").show();
        ell = $("#datepicker option:selected").text();
        let datep = this.value;
        let date = new Date();
        switch (datep) {
            case 'yesterday':
                prevmonth = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
                prevmonthend = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                makeWikiRequest(datasource);
                break;
            case 'today':
                prevmonth = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                prevmonthend = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
                makeWikiRequest(datasource);
                break;
            case 'lastweek':
                prevmonth = new Date(date.getFullYear(), date.getMonth(), date.getDate() - datear);
                prevmonthend = new Date(date.getFullYear(), date.getMonth(), date.getDate() - datear + 6);
                makeWikiRequest(datasource);
                break;
            case 'thismonth':
                prevmonth = new Date(date.getFullYear(), date.getMonth() - 0, 1);
                prevmonthend = new Date(date.getFullYear(), date.getMonth() - 0, 30);
                month = new Date(date.getFullYear(), date.getMonth(), 1);
                makeWikiRequest(datasource);
                break;
            case 'lastmonth':
                prevmonth = new Date(date.getFullYear(), date.getMonth() - 1, 1);
                prevmonthend = new Date(date.getFullYear(), date.getMonth() - 1, 30);
                makeWikiRequest(datasource);
                break;
            case 'last7days':
                prevmonth = new Date(Date.now() - 7 * 86400000);
                prevmonthend = new Date(Date.now());
                makeWikiRequest(datasource);
                break;
            case 'last30days':
                prevmonth = new Date(Date.now() - 30 * 86400000);
                prevmonthend = new Date(Date.now());
                makeWikiRequest(datasource);
                break;
            case 'custom':
                $("#loading").hide();
                $("<div id='datepickercustom'>Start Date: <input type='date' id='datepicker-start'> End Date: <input type='date' id='datepicker-end'> <button id='customdateload'>Load</button></div>").insertAfter("#datepicker");
                prevmonth = new Date($("#datepicker-start").val());
                prevmonthend = new Date($("#datepicker-end").val());
                $("#datepickercustom").css({
                    "text-align": "right",
                    "font-size": "15px"
                });
                $("#datepickercustom input").css({
                    "height": "42px",
                    "width": "125px",
                    "font-size": "15px",
                    "border-radius": "5px",
                    "margin": "0 5px 0 5px"
                });
                $("#datepickercustom button").css({
                    "border-radius": "5px",
                    "font-weight": "bold",
                    "margin": "5px",
                    "background": "rgb(56, 127, 191)",
                    "padding": "0 15px 0 15px"
                });
                $("#customdateload").click(function() {
                    prevmonth = new Date($("#datepicker-start").val());
                    prevmonthend = new Date($("#datepicker-end").val());
                    var prevmonth1 = dateconverter(prevmonth);
                    var prevmonthend1 = dateconverter(prevmonthend);

                    function dateconverter(datec) {
                        datec = ((datec.getMonth() > 8) ? (datec.getMonth() + 1) : ('0' + (datec.getMonth() + 1))) + '/' + ((datec.getDate() > 9) ? datec.getDate() : ('0' + datec.getDate())) + '/' + datec.getFullYear()
                        return datec
                    }
                    ell = "" + prevmonth1 + " to " + prevmonthend1 + "";
                    if (isNaN(prevmonth) || isNaN(prevmonthend)) {
                        alert("Date range is not selected!");
                    } else {
                        if (prevmonth - prevmonthend > 0) {
                            alert("Incorrect date range!");
                        } else {
                            $("#loading").show();
                            makeWikiRequest(datasource);
                        }
                    }
                });
                break;

        }
    });

    function testtime(prevmonth, prevmonthend) {
        console.log("startdate::", prevmonth);
        console.log("enddate::", prevmonthend);
    }

    function makeWikiRequest(datasource) {
        $.ajax({
            url: 'datasource/datasource.json',
            type: 'GET',
            dataType: 'json',
            headers: {
                'accept': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            success: appendData
        });
        ete = ".dash-tablebody-update";
    }

    function exportTableToExcel(ete, date) {
        let table = document.querySelector(ete);
        TableToExcel.convert(table, {
            name: "" + ete + " - " + date + ".xlsx",
            sheet: {
                name: "Sheet 1"
            }
        });
    }
    $("#export").click(function() {
        exportTableToExcel(ete, date)
    });

    function appendData(out) {

        $(".wikigeneratedheader").show();
        $("#loader").hide();
        $("#loading").hide();
        $(".panel-body").html("<div id='wiki-dash-container'></div>");
        $("#wiki-dash-container").append("<div id='dash-head'></div><div id='dash-count'></div><input id='filter-search' placeholder='Search for.. domain name, author, date etc.' title='you can search for domain name, author, date etc.'></input><div id='dash-body'></div><div id='dash-chart'></div>");
        $("#dash-body").append("<table data-cols-width='60,40,40,10,25,25' class='dash-tablebody-total' style='display:none;'><thead><tr><th data-f-bold='true'>All SOP articles</th><th style='display:none;'>SOP URL</th><th data-f-bold='true'>Domain Process</th><th data-f-bold='true'>Author</th><th data-f-bold='true'>Created Date</th><th data-f-bold='true'>Last updated</th></tr></thead><tbody class='dash-tablebody-filter' id='dash-tablebody-total'></tbody></table>");
        $("#dash-body").append("<table data-cols-width='60,40,10,25' class='dash-tablebody-update'><thead><tr><th data-f-bold='true'>Recently updated SOP article</th><th data-f-bold='true'>Domain Process</th><th data-f-bold='true'>Updater</th><th data-f-bold='true'>Date</th></tr></thead><tbody class='dash-tablebody-filter' id='dash-tablebody-update'></tbody></table>");
        $("#dash-body").append("<table data-cols-width='60,40,10,25' class='dash-tablebody-newcreated' style='display:none;'><thead><tr><th data-f-bold='true'>New SOP article " + ell + "</th><th data-f-bold='true'>Domain Process</th><th data-f-bold='true'>Updater</th><th data-f-bold='true'>Date</th></tr></thead><tbody class='dash-tablebody-filter' id='dash-tablebody-newcreated'></tbody></table>");
        $("#dash-chart").append("<div id='dash-chart-inner'></div>");
        let $dashCount = $("#dash-count");
        let $dashTablebodyTotal = $(".dash-tablebody-total");
        let $dashTablebodyUpdate = $(".dash-tablebody-update");
        let $dashTablebodyNewCreated = $(".dash-tablebody-newcreated");
        let $dashChartInner = $("#dash-chart-inner");
        $dashChartInner.append("<table style='width:100%;text-align:left;max-width:900px;max-height:330px;'><thead><tr><th>New SOP article " + ell + "</th><th>Contributor</th><th>Date</th></tr></thead><tbody id='dash-tablebody-new'></tbody></table>");
        $dashCount.append("<div id='dash-count-1' class='dash-count-click'></div><div id='dash-count-2' class='dash-count-click'></div><div id='dash-count-3' class='dash-count-click'></div>");
        $("#filter-search").on("keyup", function() {
            let value = $(this).val().toLowerCase();
            $(".dash-tablebody-filter tr").each(function() {
                if ($(this).text().toLowerCase().search(value) > -1) {
                    $(this).show();
                    $(this).prev('.subjectName').last().show();
                    $(this).attr('data-exclude', 'false');
                } else {
                    $(this).hide();
                    $(this).attr('data-exclude', 'true');
                }
            });
        })
        $dashCount.css({
            "display": "flex",
            "gap": "5px"
        });
        $("#filter-search").css({
            "margin-top": "10px",
            "width": "400px",
            "padding": "5px"
        });
        $(".dash-count-click").css({
            "cursor": "pointer"
        });
        $("#dash-count div").css({
            "height": "100px",
            "width": "400px",
            "color": "#FFFFFF",
            "text-align": "left"
        });
        $(".panel-body").css({
            "max-width": "2500px",
            "max-height": "100%"
        });
        $("table,.wikigeneratedheader").css({
            "max-width": "2500px"
        });
        $("#wiki-dash-container").css({
            "height": "100%",
            "width": "100%"
        });
        $("#dash-body").css({
            "text-align": "left",
            "overflow-y": "auto",
            "max-height": "700px",
            "height": "100%",
            "margin-top": "10px",
            "background-color": "#F5F5F5",
            "overflow-x": "hidden"
        });
        $dashChartInner.css({
            "overflow": "auto",
            "max-width": "930px",
            "max-height": "370px",
            "width": "100%",
            "overflow-x": "hidden",
            "margin-right": "10px"
        });
        $("#dash-chart").css({
            "margin-top": "10px",
            "width": "100%",
            "display": "flex",
            "height": "370px",
            "overflow": "hidden"
        });
        $("th").css({
            "text-align": "left"
        });
        $(".amazon-wiki-toc").css({
            "display": "none"
        });
        $("#datepicker").css({
            "text-align": "right",
            "float": "right"
        });
        $("#dash-count-1").css({
            "background": "#387FBF"
        });
        $("#dash-count-2").css({
            "background": "#44A9C7",
            "border-bottom": "7px solid #364d6a"
        });
        $("#dash-count-3").css({
            "background": "#55DBDF"
        });
        const cnt = out.totalrows;
        let week = 1659022067105;
        let x = 1,
            y = 0,
            m = 0,
            cntt = 0;
        let newart = "";
        let dateholder = "";
        const content = "";
        let baba = 0;
        let urltr = "";
        let sopurl = "";
        let sop = "";
        const datearray = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        const docCreator = [];
        const docspace = [];
        let docspacetemp="";
        while (x < cnt) {
            const doccD = new Date(out.rows[x].doc_date);
            const doccDD = new Date(out.rows[x].doc_creationDate);
            urltr = out.rows[x].doc_url;
            const sopurl = typeof urltr === 'string' ? urltr.split('/') : [];
            sop = sopurl[7]?.replace(/([A-Z])/g, ' $1').trim();
            if (date.getFullYear() == doccDD.getFullYear()) {
                datearray[doccDD.getMonth()] += 1;
            }
            if (typeof out.rows[x].doc_title != "undefined") {
                docspacetemp = out.rows[x].doc_space.replace(/\./g,'/spaces/');
                docspace.push("https://w.amazon.com/rest/wikis/xwiki/spaces/"+docspacetemp+"/pages/WebHome/comments/?media=json");
                $("#dash-tablebody-total").append("<tr><td><a href='https://w.amazon.com" + out.rows[x].doc_url + "' target='_blank'>" + out.rows[x].doc_title + "</a></td><td style='display:none;'>https://w.amazon.com" + out.rows[x].doc_url + "</td><td>" + sop + "</td><td><a href='https://phonetool.amazon.com/users/" + out.rows[x].doc_creator + "' target='_blank'>" + out.rows[x].doc_creator + "</a></td><td>" + out.rows[x].doc_creationDate + "</td><td>" + timelapse(out.rows[x].doc_date) + " ago.</td></tr>");
                cntt++;
            }
            if (doccD.getTime() >= prevmonth && doccD.getTime() <= prevmonthend) {
                docCreator.push(out.rows[x].doc_author);
                $("#dash-tablebody-update").append("<tr><td><a href='https://w.amazon.com" + out.rows[x].doc_url + "' target='_blank'>" + out.rows[x].doc_title + "</a></td><td>" + sop + "</td><td><a href='https://phonetool.amazon.com/users/" + out.rows[x].doc_author + "' target='_blank'>" + out.rows[x].doc_author + "</a></td><td>" + out.rows[x].doc_date + "</td></tr>");
                dateholder = out.rows[x].doc_date
                y++;
            }
            if (doccDD.getTime() >= prevmonth && doccDD.getTime() <= prevmonthend) {
                m++;
                $("#dash-tablebody-new").append("<tr><td><a href='https://w.amazon.com" + out.rows[x].doc_url + "' target='_blank'>" + out.rows[x].doc_title + "</a></td><td><a href='https://phonetool.amazon.com/users/" + out.rows[x].doc_creator + "' target='_blank'>" + out.rows[x].doc_creator + "</a></td><td>" + out.rows[x].doc_creationDate + "</td></tr>");
                $("#dash-tablebody-newcreated").append("<tr><td><a href='https://w.amazon.com" + out.rows[x].doc_url + "' target='_blank'>" + out.rows[x].doc_title + "</a></td><td>" + sop + "</td><td><a href='https://phonetool.amazon.com/users/" + out.rows[x].doc_creator + "' target='_blank'>" + out.rows[x].doc_creator + "</a></td><td>" + out.rows[x].doc_creationDate + "</td></tr>");
            }
            x++;
        }

        $("#dash-chart").append("<canvas id='myChart' style='width:100%;max-width:750px'></canvas>");
        $("#dash-chart").append("<canvas id='myChart2' style='width:100%;max-width:740px'></canvas>");
        $("#dash-count-1").append("<div id='dash-count-num-1'>" + cntt + "</h3><br><div id='dash-count-text-1' title='This will return all SOP article.'>Total SOP Article</div>");
        $("#dash-count-2").append("<div id='dash-count-num-2'>" + y + "</h3><br><div id='dash-count-text-2' title='This will return SOP that was recently updated.'>Updated SOP article " + ell + "</div>");
        $("#dash-count-3").append("<div id='dash-count-num-3'>" + m + "</h3><br><div id='dash-count-text-3' title='This will return newly created article.'>New SOP article " + ell + "</div>");
        $("#dash-count-num-1,#dash-count-num-2,#dash-count-num-3").css({
            "font-size": "45px",
            "font-weight": "bold",
            "padding-left": "20px",
            "margin": "30px"
        });
        $("#dash-count-text-1,#dash-count-text-2,#dash-count-text-3").css({
            "font-size": "14px",
            "padding-top": "10px"
        });
        $("#dash-chart canvas,table").css({
            "background-color": "#F5F5F5",
            "padding": "10px",
            "margin-right": "10px"
        });
        $(".wikigeneratedheader select").css({
            "text-align": "left",
            "width": "400px"
        });
        $(".wikigeneratedheader").css({
            "text-align": "left",
            "padding-bottom": "0px"
        });
        $("#HSOPDashboard button").css({
            "height": "40px",
            "font-size": "15px",
            "padding": "0 20px 0 20px"
        });
        $("#refresh").click(function() {
            makeWikiRequest();
        });

        //checkcomment
        // Function to fetch JSON data from a URL
        function fetchJSONWithDelay(url, delay) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    fetch(url)
                        .then(response => {
                        if (!response.ok) {
                            throw new Error(`Error fetching JSON from ${url}: ${response.status}`);
                        }
                        return response.json();
                    })
                        .then(data => resolve(data))
                        .catch(error => reject(error));
                }, delay);
            });
        }

        // Function to fetch data from multiple JSON URLs with delay
        function fetchDataFromJSONUrls(docspace, delay) {
            const promises = docspace.map((url, index) => fetchJSONWithDelay(url, delay * index));
            return Promise.all(promises);
        }

        // Usage
        fetchDataFromJSONUrls(docspace, 2000) // 2000 milliseconds (2 seconds) delay between requests
            .then(data => {
            // Data is an array containing the results from all JSON URLs
            console.log(data);
        })
            .catch(error => {
            console.error(error);
        });
        //checkcommentend

        function chaaart(datearray, datasourcetext) {
            var xValues = ['January', "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            var yValues = datearray;
            var dttitle = datasourcetext;
            new Chart("myChart", {
                type: "bar",
                data: {
                    labels: xValues,
                    datasets: [{
                        backgroundColor: [
                            'rgba(56, 127, 191)',
                            'rgba(56, 127, 191)',
                            'rgba(56, 127, 191)',
                            'rgba(56, 127, 191)',
                            'rgba(56, 127, 191)',
                            'rgba(56, 127, 191)',
                            'rgba(56, 127, 191)',
                            'rgba(56, 127, 191)',
                            'rgba(56, 127, 191)',
                            'rgba(56, 127, 191)',
                            'rgba(56, 127, 191)',
                            'rgba(56, 127, 191)'
                        ],
                        borderColor: [
                            'rgba(56, 127, 191, 1)',
                            'rgba(56, 127, 191, 1)',
                            'rgba(56, 127, 191, 1)',
                            'rgba(56, 127, 191, 1)',
                            'rgba(56, 127, 191, 1)',
                            'rgba(56, 127, 191, 1)',
                            'rgba(56, 127, 191, 1)',
                            'rgba(56, 127, 191, 1)',
                            'rgba(56, 127, 191, 1)',
                            'rgba(56, 127, 191, 1)',
                            'rgba(56, 127, 191, 1)',
                            'rgba(56, 127, 191, 1)'
                        ],
                        borderWidth: 1,
                        data: yValues
                    }]
                },
                options: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: "SOP created in current year"
                    }
                }
            });
        }

        function chaaartt(contri, contrival, colorarray, ell) {
            var xValues = contri;
            var yValues = contrival;
            var cValues = colorarray;
            var ellx = ell;
            new Chart("myChart2", {
                type: "bar",
                data: {
                    labels: xValues,
                    datasets: [{
                        backgroundColor: colorarray,
                        borderColor: colorarray,
                        borderWidth: 1,
                        data: yValues
                    }]
                },
                options: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: "User updated an article " + ellx + ""
                    },
                    scales: {
                        yAxes: [{
                            display: true,
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    }
                }
            });
        }

        const count = docCreator.reduce((accumulator, value) => {
            return {
                ...accumulator,
                [value]: (accumulator[value] || 0) + 1
            };
        }, {});
        const contri = Object.keys(count);
        const contrival = Object.values(count);
        const colorcount = contri.length;
        let colorcountbase = 0;
        const colorarray = [];
        while (colorcount >= colorcountbase) {
            colorarray.push("rgb(68, 169, 199, 1)");
            colorcountbase++;
        }
        chaaart(datearray, datasourcetext);
        chaaartt(contri, contrival, colorarray, ell);

        $('.dash-count-click').click(function() {
            var el = $(this);
            var elid = el.attr('id');
            switch (elid) {
                case 'dash-count-1':
                    $dashTablebodyTotal.slideDown("slow");
                    $(".dash-tablebody-update,.dash-tablebody-newcreated").css({
                        "display": "none"
                    });
                    $dashTablebodyTotal.css({
                        "display": "revert"
                    });
                    $("#dash-count-1").css({
                        "border-bottom": "7px solid #364d6a"
                    });
                    $("#dash-count-3,#dash-count-2").css({
                        "border-bottom": "none"
                    });
                    ete = ".dash-tablebody-total";
                    break;
                case 'dash-count-2':
                    $dashTablebodyUpdate.slideDown("slow");
                    $(".dash-tablebody-total,.dash-tablebody-newcreated").css({
                        "display": "none"
                    });
                    $dashTablebodyUpdate.css({
                        "display": "revert"
                    });
                    $("#dash-count-2").css({
                        "border-bottom": "7px solid #364d6a"
                    });
                    $("#dash-count-3,#dash-count-1").css({
                        "border-bottom": "none"
                    });
                    ete = ".dash-tablebody-update";
                    break;
                case 'dash-count-3':
                    $dashTablebodyNewCreated.slideDown("slow");
                    $(".dash-tablebody-total,.dash-tablebody-update").css({
                        "display": "none"
                    });
                    $dashTablebodyNewCreated.css({
                        "display": "revert"
                    });
                    $("#dash-count-3").css({
                        "border-bottom": "7px solid #364d6a"
                    });
                    $("#dash-count-1,#dash-count-2").css({
                        "border-bottom": "none"
                    });
                    ete = ".dash-tablebody-newcreated";
                    break;
            }
        });
    }
    function timelapse(timetl) {
        let diffTime = Math.abs(new Date().valueOf() - new Date(timetl).valueOf());
        let tldays = diffTime / (24 * 60 * 60 * 1000);
        let tlhours = (tldays % 1) * 24;
        let tlminutes = (tlhours % 1) * 60;
        let tlsecs = (tlminutes % 1) * 60;
        [tldays, tlhours, tlminutes, tlsecs] = [Math.floor(tldays), Math.floor(tlhours), Math.floor(tlminutes), Math.floor(tlsecs)]
        timetl = tldays + ' day(s)';
        return timetl;
    }
    function loadchartscript() {
        var s = document.createElement("script");
        s.type = "text/javascript";
        s.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.4.0/Chart.min.js";
        $("head").append(s);
    }
    setTimeout(loadchartscript(), 1000);
    makeWikiRequest(datasource);
}

function waitForElement() {
    
  if (typeof jQuery !== "undefined") {
    jqueryize(addJobData);
  } else {
    setTimeout(waitForElement, 250);
  }
}
waitForElement();