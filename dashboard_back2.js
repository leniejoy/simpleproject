<script type="text/javascript" src="../SiteAssets/jquery.js"> </script>
<script src="//mozilla.github.io/pdf.js/build/pdf.js"></script>
<style>

	.ms-dialogHidden{display: none}
	#myDocs{
		margin: auto;
	}
	#displaydoc{
		margin: auto;
		width:90%;
		height:623px;
		frameborder:0;
	}
	#the-canvas {
		display: inline;
		direction: ltr;
	}
	.container {
		margin: auto;
		width: 100%;
   		text-align: center !important;
   		border: 1px solid black;
	}
	#WebPartWPQ4_ChromeTitle{
		display: none;
	}
	#pdf_menu {
		width: 100%;
	}
	#next, #done{float: right}
	.pdfbtn{width: 100px; height: 40px;font-size: 13px}
	
	#tableDiv table{width: 600px}
	#tableDiv #myTablePassed{width: 709px !important}
	#tableDiv table tbody tr td, #tableDiv table thead th, #tableDiv table thead tr td,{border-color: #808080}
	#tableDiv table thead tr td{padding:6px 6px;background-color:#4682B4; color:white;}
	#tableDiv table tbody tr td{padding: 5px 5px; text-align: center}
	#tableDiv table tbody tr td:nth-child(4), #tableDiv table thead th:nth-child(4){border: none !important}
	#tableDiv table thead th {text-align:center; padding: 5px 5px}
	
	#tableDiv table tbody tr td:last{background-color: white !important; width: 86px !important}
	#tableDiv table tbody tr:nth-of-type(even){background-color:#ffffff}	
	#tableDiv table tbody tr:nth-of-type(odd){background-color:#F5F5F5}
	
	
	#myProgress {
	  width: 80%;
	  background-color: #DCDCDC;
	  display: inline-block;
	}
	
	#myBar {
	  width: 0%;
	  height: 15px;
	  background-color: #1f85c7;
	  text-align: center;
	  color:white
	}
	
	#centerprogress{
		text-align: center;
	}
	
	.scrollable {
		height: 500px;/* or any value */
		overflow-y: auto;
    }
</style>

	<p id='examList'></p>
	<div id='employeeInfo'>
		<b>Employee Name: </b><p id='name'></p>
		<b>Department: </b><p id='dept'></p>
	</div>
	
	<div id='myPage'>
		<div id='tableDiv'></div>
		<button id="back" class="pdfbtn" onclick='fncReload()'>Go Back</button><br><br>
		<div id='centerprogress'>
			<span id="pdf_progress"></span>&nbsp<div id="myProgress"><div id="myBar"></div>
		</div>
		 <span>Page: <span id="page_num"></span> / <span id="page_count"></span></span>
		<br><br>
		<div class='container scrollable' >
			<canvas id="the-canvas"></canvas>
		</div>
	</div>
		
	<div id='pdf_menu'>
		  <br><br>
		  <button id="prev" class="pdfbtn">Previous</button>
		  <button id="next" class="pdfbtn">Next</button>
		  <button id='done' class="pdfbtn">Start Exam</button>
		  &nbsp; &nbsp;</br></br>		  
		</div>
	</div>
	
	

<script>
//<iframe id="Exam" width="100%" height="500px" frameborder= "0" marginwidth= "0" marginheight= "0" style= "border: none; max-width:100%; max-height:100vh; margin: auto; display:block;" allowfullscreen webkitallowfullscreen mozallowfullscreen msallowfullscreen> </iframe>
	$(function() {
		fncView("dashboard","");
		$('#centerprogress').hide();
		$('#pdf_menu').hide();
		$('#done').hide();
		//$('#Exam').hide();
		$('#back').hide();
	});
	
	function fncLoadDocs(name, examUrl, vProgress, vID)
	{
		event.preventDefault();
		$('#done').attr('onclick','fncStartExam("'+examUrl+'", '+vID+')');
		$("#myDocs").empty();
		$('#employeeInfo').empty();
		$('#tableDiv').hide();
		$('#centerprogress').show();
		$('#pdf_menu').show();
		$('#back').show();
		
		if(vProgress==1){$('#prev').hide();$('#next').show();}
		
		var pdfjsLib = window['pdfjs-dist/build/pdf'];
		
		// The workerSrc property shall be specified.
		pdfjsLib.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js';
		
		var pdfDoc = null,
		    pageNum = parseInt(vProgress),//put the curretn page here
		    pageRendering = false,
		    pageNumPending = null,
		    scale = 1.5,
		    canvas = document.getElementById('the-canvas'),
		    ctx = canvas.getContext('2d'),
		    progress = 0;
		
		/**
		 * Get page info from document, resize canvas accordingly, and render page.
		 * @param num Page number.
		 */
		function renderPage(num)
		{
			if (pageRendering) {pageNumPending = num;}
			else
			{
				pageRendering = true;
				// Using promise to fetch the page
				pdfDoc.getPage(num).then(function(page)
				{
				    var viewport = page.getViewport({scale: scale});
				    console.log('scale',viewport.height, viewport.width);
				    canvas.height = viewport.height;
				    canvas.width = viewport.width;
				
				    // Render PDF page into canvas context
				    var renderContext = {
				      canvasContext: ctx,
				      viewport: viewport
				    };
				    var renderTask = page.render(renderContext);
				
				    // Wait for rendering to finish
				    renderTask.promise.then(function()
				    {
				    	pageRendering = false;
				      	if (pageNumPending !== null)
				      	{
					        // New page rendering is pending
					        renderPage(pageNumPending);
					        pageNumPending = null;
					    }
				    });
				});
				
				checkProgress();
				// Update page counters
				document.getElementById('page_num').textContent = num;
				document.getElementById('pdf_progress').textContent = progress+'%';
				
				 var elem = document.getElementById("myBar");
				 elem.style.width = progress + "%";
			}
		}
	
		/**
		* If another page rendering in progress, waits until the rendering is
		* finised. Otherwise, executes rendering immediately.
		*/
		
		/**
		* Displays previous page.
		*/
			
		//document.getElementById('prev').addEventListener('click', onPrevPage);
		$('#prev').click(function onPrevPage(e)
		{
			if (pageNum <= 1) {	return false;}
		  	pageNum--;
		  	console.log(pageNum , pdfDoc.numPages);
		 	if(pageNum != pdfDoc.numPages && pageNum != 1) {
			  	$('#done').hide();
			  	$('#next').show();
		  	}
			else {
				$('#prev').hide();
				$('#next').show();
			}
			renderPage(pageNum);
			e.preventDefault();
		});
			
		/**
		* Displays next page.
		*/

		$('#next').click(function onNextPage(e)
		{
			if (pageNum >= pdfDoc.numPages) {	return false;	}
			pageNum++;
			if(pageNum == pdfDoc.numPages) {
				$('#prev').show();
				$('#next').hide();
			}
			else {
				$('#prev').show();
				$('#next').show();
			}
			var vPercentage = checkProgress();
			renderPage(pageNum);
			
			var itemProperties = {'__metadata' : { 'type': 'SP.Data.EmployeeListListItem' },	'ReadingProgress': pageNum.toString(), 'ReadingProgressPercentage': vPercentage.toString()	};
			updateListItem('EmployeeList',itemProperties,vID)
			.done(function(data){	console.log('Page num successfully updated for ', vID);	})
			.fail(function(error){console.log("Failed to save", error);return "0";	});
			e.preventDefault();
		});
			
		/**
		* Asynchronously downloads PDF.
		*/
		var url= "https://mgenesis.sharepoint.com/sites/LearningManagementSystem2/Shared%20Documents/"+name;
		pdfjsLib.getDocument(url).promise.then(function(pdfDoc_)
		{
			pdfDoc = pdfDoc_;
			document.getElementById('page_count').textContent = pdfDoc.numPages;
			console.log('render page number', pageNum);
			// Initial/first page rendering
			checkProgress();
			renderPage(pageNum);
		});
			
		function checkProgress()
		{
			var pr = document.getElementById('pdf_progress').textContext;
			var percent = Math.round((pageNum/pdfDoc.numPages)*100);
			if(progress>percent) {	return false;	}
			else {	progress = percent; 	}
			if(progress == 100) {	$('#done').show(); $('#next').hide();}
			return progress;
		}
	}
		
	function fncStartExam(url, vID)
	{
		event.preventDefault();
		var c = confirm("You are about to start the exam. You cannot go back to the module once you click 'ok'. Do you wish to proceed?");
		if(c){
			var itemProperties = {'__metadata' : { 'type': 'SP.Data.EmployeeListListItem' },	'EndDate': getDateFormat(new Date())	};
			updateListItem('EmployeeList',itemProperties,vID)
			.done(function(data)
			{	
				console.log('End date successfully updated for ', vID);
				//$('#Exam').show();
				$('#myPage').empty();
				location.replace("https://mgenesis.sharepoint.com/sites/LearningManagementSystem2/SitePages/ExaminationPage.aspx?List="+url+"&vID="+vID)
				//window.open(url);
				//$('#Exam').attr('src',url);
			})
			.fail(function(error){console.log("Failed to save", error);return "0";	});
		}
	}
	
	function fncView(view, department)
	{
		$("#myTable > tbody").empty();
		var y=1;
		if(view == 'dashboard')
		{			
			//get current user ID
			var jQry = getJsonQRY("/_api/web/currentuser");
			var userName =jQry.d.Id;
	
			//post current user data
			var vGetItems = getJsonQRY("/_api/web/lists/getbytitle('EmployeeList')/items?&$expand=Department/Title,Course/ExamList,Course/PDFName,Course/Module,Course/Title&$select=Department/Title,Course/ExamList,Course/PDFName,Course/Module,Course/Title,*&$filter=(EmployeeNameId eq "+jQry.d.Id+") and (Result ne 'Passed')");
			console.log(vGetItems);
			$('#name').html(jQry.d.Title);
			$('#dept').html(vGetItems.d.results[0].Department.Title);
			
			var vGetCoursesArray = new Array();//to get one type of all
			for(x=0;x<vGetItems.d.results.length;x++)
			{
				console.log('dito leniya',vGetItems.d.results[x].CourseId,vGetItems.d.results.length, x,vGetItems.d.results[x].Course.Title, vGetItems.d.results[x].Course.Module);
				console.log('vGetCoursesArray',vGetCoursesArray)
				console.log(vGetCoursesArray.includes(vGetItems.d.results[x].CourseId));
				if(!vGetCoursesArray.includes(vGetItems.d.results[x].CourseId))
				{
					vGetCoursesArray.push(vGetItems.d.results[x].CourseId);
					console.log('vGetItems.d.results[x].CourseId',vGetItems.d.results[x].CourseId)
					
					var vTable = fncCreateTableHeader('tableDiv', vGetItems.d.results[x].Course.Title,'myTable'+x);
					var vItems = vGetItems;
					
					
					var vButtonName;
					for(y=0;y<vItems.d.results.length;y++)
					{
						if(vItems.d.results[y].CourseId == vGetItems.d.results[x].CourseId)
						{
							//console.log('same');
							vTable.find('tbody').append('<tr></tr>');
							vTable.find("tr:last").append('<td>'+vItems.d.results[y].Course.Module+'</td>');
							vTable.find("tr:last").append('<td>'+vItems.d.results[y].StartDate+'</td>');
							vTable.find("tr:last").append('<td>'+vItems.d.results[y].Result+'</td>');
							
							if(vItems.d.results[y].Result == 'New !'){vButtonName = 'Start';}
							else if(vItems.d.results[y].Result == 'Started'){vButtonName = 'Continue';}
							else if(vItems.d.results[y].Result == 'Passed'){vButtonName = 'hide';}
							else if(vItems.d.results[y].Result == 'Failed'){vButtonName = 'hide';}
							
							if(vButtonName != 'hide')
								vTable.find("tr:last").append('<td><button type="button" vprogress="'+vItems.d.results[y].ReadingProgress+'" vid="'+vItems.d.results[y].ID+'" vexam="'+vItems.d.results[y].Course.ExamList+'"  vpdf="'+vItems.d.results[y].Course.PDFName+
								'" onclick="fncToLoadDocument(this)">'+vButtonName+'</button></td>');
						}
					}
				}
			}
			
			var vGetPassedItems = getJsonQRY("/_api/web/lists/getbytitle('EmployeeList')/items?&$expand=Department/Title,Course/ExamList,Course/PDFName,Course/Module,Course/Title&$select=Department/Title,Course/ExamList,Course/PDFName,Course/Module,Course/Title,*&$filter=(EmployeeNameId eq "+jQry.d.Id+") and (Result eq 'Passed')");
			var vTablePassed = fncCreateTableHeader('tableDiv', 'Passed Modules','myTablePassed');
			
			for (x=0;x<vGetPassedItems.d.results.length;x++)
			{
				vTablePassed.find('tbody').append('<tr></tr>');
				vTablePassed.find("tr:last").append('<td>'+vGetPassedItems.d.results[x].Course.Title+" : "+vGetPassedItems.d.results[x].Course.Module+'</td>');
				vTablePassed.find("tr:last").append('<td>'+vGetPassedItems.d.results[x].StartDate+'</td>');
				vTablePassed.find("tr:last").append('<td>'+vGetPassedItems.d.results[x].Result+'</td>');
				vTablePassed.find("tr:last").append('<td><button onclick="fncAlertCons()">Generate Certificate</button></td>');
			}			

		}
	}
	
	function fncAlertCons()
	{
		event.preventDefault();
		alert('This feature is under construction.');
	}
	//function fncCheckNull(vString){ console.log('this is ur string', vString);if(!vString || vString === null){ console.log('null'); return "--"}else{return vString;}}	
	function fncToLoadDocument(vElement)
	{
		event.preventDefault();
		
		var vModuleUrl = $(vElement).attr('vpdf');
		var vExamUrl = $(vElement).attr('vexam');
		var vProgress = $(vElement).attr('vprogress');
		var vID = $(vElement).attr('vid');
		
		var vStatus = $(vElement).text();
		
		if( vStatus == 'Start')
		{
			var c = confirm('You are about to proceed to a module and by clicking ok, your reading time will be monitored. Do you wish to proceed?');
			if(c)
			{	
				var itemProperties = {'__metadata' : { 'type': 'SP.Data.EmployeeListListItem' },	'StartDate': getDateFormat(new Date()), 'Result': 'Started'	};
				updateListItem('EmployeeList',itemProperties,vID)
				.done(function(data)
					{	console.log('Start date successfully updated for ', vID);
						fncLoadDocs(vModuleUrl, vExamUrl,vProgress, vID);
						$('pdfmenu').show();
					})
				.fail(function(error){console.log("Failed to save", error);return "0";	}); 
			}
		}
		else{
			var c = confirm('Continue this module?');
			if(c)
			{
				fncLoadDocs(vModuleUrl, vExamUrl, vProgress, vID);
				$('pdfmenu').show();
			}
		}
	}	
	
	function fncCreateTableHeader(vDiv,vCourseTitle, vTableID)
	{	
		$('#'+vDiv).append('<br/><br/>');
		
		var vTable = $('<table id="'+vTableID+'" border="1"><thead><tr><td align="left" colspan="3"><b>'+vCourseTitle+
		'</b></td></tr><th>Module Name</th><th>Date Started</th><th>Result</th></thead><tbody><tfoot>');// style="width:130px"
		
		$('#'+vDiv).append(vTable);					
		return vTable;
	}

	/*function fncAddRow()
	{	        
		$("#myTable").append("<tr></tr>"); 
		var vHeaderLength = $('#myTable > thead').find("th").length;
		for(i=0;i<vHeaderLength;i++){	$("#myTable > tbody > tr:last").append("<td></td>");	}
	}
*/	
	function fncReload()
	{
		var c = confirm("Click 'ok' to confirm action.");
		if(c){location.reload();}
		else{event.preventDefault();}
	}

	
	function updateListItem(listName,itemProperties,vID)
	{	   
   		return $.ajax({       
	       url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + listName + "')/items("+vID+")",   
	       type: "POST",   
	       processData: false,  
	       contentType: "application/json;odata=verbose",
	       data: JSON.stringify(itemProperties),
	       headers: {   
	          "Accept": "application/json;odata=verbose",
	          "X-RequestDigest": $("#__REQUESTDIGEST").val(),  
        	  "IF-MATCH": "*",  
        	  "X-HTTP-Method": "MERGE"
	       }  
	    });
	}


	function getJsonQRY(url){
		return JSON.parse($.ajax({
			url: _spPageContextInfo.webAbsoluteUrl + url,
			method: "GET",
			dataType: 'json',
			global: false,
			async:false,
			
			headers: { "Accept": "application/json; odata=verbose" },
			success: function (data) {
				return data;
			},
			error: function (data) {
				alert("Error: "+ data);
			}
		}).responseText);
	}
	
	function getDateFormat(date)
	{
		if(fncCheckNull(date) != '--')
		{
			var dateToFormat = new Date(date);
			//console.log('dateToFormat ',dateToFormat);
			var dd = dateToFormat.getDate();
			var mm = dateToFormat.getMonth()+1; //January is 0!
			var yyyy = dateToFormat.getFullYear();
			var hh = dateToFormat.getHours() ;
			var min = dateToFormat.getMinutes();
			var ss =  dateToFormat.getSeconds();
			var vTimeZone;
			
			if(dd<10) { dd = '0'+dd } 
			if(mm<10) { mm = '0'+mm } 
			if(min<10) { min = '0'+min} 
			if (hh > 12){
				hh = hh - 12;
				vTimeZone = hh.toString() +  ":" + min+" PM";
			}
			else if(hh == 12){
				vTimeZone = hh.toString() +  ":" + min+ " PM";
			}
			else if( hh < 12){
			 	vTimeZone = hh.toString() +  ":" + min+ " AM";
			}
			var vFinalDate = mm + '/' + dd + '/' + yyyy+" - "+vTimeZone;
			return vFinalDate ;
		}
		else{return '--';}
	}

function fncCheckNull(vString){ console.log('this is ur string', vString);if(!vString || vString === null){ console.log('null'); return "--"}else{return vString;}}

</script>