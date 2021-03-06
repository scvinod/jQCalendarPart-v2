<script type="text/javascript" language="javascript" src="/sites/devsite/jQCalendarPart/jquery-2.1.4.min.js"></script>
<script src="/sites/devsite/jQCalendarPart/jquery-ui.min.js"></script>
<link rel="stylesheet" type="text/css" href="/sites/devsite/jQCalendarPart/jquery-ui.min.css" />
<script type="text/javascript" src="/sites/devsite/jQCalendarPart/jquery.SPServices-0.7.2.min.js"></script>

<script type="text/javascript">
	JSRequest.EnsureSetup();

	var today = new Date();
	var currDate = new Date();
	var liHtml;
	var calliHtml;
	var itemURL;
	var eventDuration;
	var date;
	var currentDate = null;
	var currWeekDate = null;
	var datetext;
	var calendarDate;
	var siteRelUrl = L_Menu_BaseUrl;
	var currentTime;
	var hours;
	var minutes;
	var lastday;
	var isNextMnth;
	var camlFields;
	var camlQuery;
	var camlOptions;
	var formattedTime;
	var i;
	var calendarListItems;

	(function($)
	{

		var _updateDatepicker_o = $.datepicker._updateDatepicker;
		$.datepicker._updateDatepicker = function(inst)
		{
			_updateDatepicker_o.apply(this, [inst]);
			processResult();
		};

		$(function()
		{
			getCalendarData(today.getFullYear(), today.getMonth(), today.getDate());
		});

		function getCalendarData(year, month, date)
		{
			calendarDate = year + "-" + month + "-1";

			camlFields = "<ViewFields><FieldRef Name='Title' /><FieldRef Name='EventDate' /><FieldRef Name='EndDate' /><FieldRef Name='Location' /><FieldRef Name='Description' /><FieldRef Name='fRecurrence' /><FieldRef Name='RecurrenceData' /><FieldRef Name='RecurrenceID' /><FieldRef Name='fAllDayEvent' /></ViewFields>";
			camlQuery = "<Query><CalendarDate>" + calendarDate + "</CalendarDate><Where><DateRangesOverlap><FieldRef Name='EventDate' /><FieldRef Name='EndDate' /><FieldRef Name='RecurrenceID' /><Value Type='DateTime'>Month</Value></DateRangesOverlap></Where><OrderBy><FieldRef Name='EventDate' /></OrderBy></Query>";
			camlOptions = "<QueryOptions><CalendarDate>" + calendarDate + "</CalendarDate><RecurrencePatternXMLVersion>v3</RecurrencePatternXMLVersion><ExpandRecurrence>TRUE</ExpandRecurrence><DateInUtc>TRUE</DateInUtc></QueryOptions>";

			$().SPServices(
			{
				operation: "GetListItems",
				async: false,
				listName: "Calendar",
				CAMLViewFields: camlFields,
				CAMLQuery: camlQuery,
				CAMLQueryOptions: camlOptions,
				completefunc: applyCalendarData
			});
		}

		function applyCalendarData(xData, status)
		{
			calendarListItems = xData;
			$(".divDatePicker").datepicker();
			$(".divDatePicker .anchCalLi").click(function() {
					window.location.href = $(this).attr('href');
			});
		}

		function processResult()
		{
			lastday = new Date();
			currentDate = null;
			i = 7 - (currDate.getDay() + 1);
			lastday.setDate(lastday.getDate() + i);

			$(calendarListItems.responseXML).SPFilterNode("z:row").each(function()
			{
				date = new Date($(this).attr("ows_EventDate").substring(0, 4), $(this).attr("ows_EventDate").substring(5, 7) - 1, $(this).attr("ows_EventDate").substring(8, 10), $(this).attr("ows_EventDate").substring(11, 13), $(this).attr("ows_EventDate").substring(14, 16), $(this).attr("ows_EventDate").substring(17, 19));

				itemURL = siteRelUrl + "/Lists/Calendar/DispForm.aspx?ID=" + $(this).attr("ows_ID");

				if ($(this).attr("ows_fAllDayEvent") == '1')
				{
					eventDuration = "(All day event)";
				}
				else
				{
					eventDuration = '(' + getFormattedTime($(this).attr("ows_EventDate")) + ' - ' + getFormattedTime($(this).attr("ows_EndDate")) + ')';
				}
					
				$('.divDatePicker .ui-datepicker-calendar a')
					.filter(function(index)
					{
						return $(this).text() == date.getDate() &&
							$(this).parent('td').attr("data-year") == date.getFullYear() &&
							$(this).parent('td').attr("data-month") == date.getMonth();
					}).css("border", "2px solid #2989d1");
					
				if($('.divDatePicker .ui-datepicker-calendar a').first().parent('td').attr("data-year") == date.getFullYear() && $('.divDatePicker .ui-datepicker-calendar a').first().parent('td').attr("data-month") == date.getMonth()){					
					//Creating popup for the very first list item	
					if (currentDate == null)
					{
						CreatePopUp(date, eventDuration, itemURL, $(this).attr("ows_Title"));
					}
	
					//Creating popup for the next set of list items that have different event date
					else if (date.getDate() != currentDate.getDate())
					{
						CreatePopUp(date, eventDuration, itemURL, $(this).attr("ows_Title"));
					}
					//Adding LIs to the same set of list items that have the same event date
					else if (date.getDate() == currentDate.getDate())
					{
						calliHtml = '<li class="divCalendarLI"><a class="anchCalLi" href="' + itemURL + '">' + $(this).attr("ows_Title") + '</a> ' + eventDuration + '</li>';
						$(".divDatePicker #" + date.getDate() + "_eventPopUp" + " .divCalendarUL").append(calliHtml);
					}
				}
				currentDate = date;
			});
		}

		function CreatePopUp(eventDate, eventDuration, itemURL, title)
		{

			if ($(".divDatePicker #" + eventDate.getDate() + "_eventPopUp").html() != null)
			{
				$(".divDatePicker #" + eventDate.getDate() + "_eventPopUp").empty();
			}

			$('.divDatePicker .ui-datepicker-calendar a')
				.filter(function(index)
				{
					return $(this).text() == eventDate.getDate() &&
						$(this).parent('td').attr("data-year") == eventDate.getFullYear() &&
						$(this).parent('td').attr("data-month") == eventDate.getMonth();
				}).parent('td').append("<div class='eventPopUpDiv' id='" + eventDate.getDate() + "_eventPopUp' style='display:none'></div> ");

			$('.divDatePicker .ui-datepicker-calendar a')
				.filter(function(index)
				{
					return $(this).text() == eventDate.getDate() &&
						$(this).parent('td').attr("data-year") == eventDate.getFullYear() &&
						$(this).parent('td').attr("data-month") == eventDate.getMonth();
				}).parent('td').mouseover(function()
				{
					document.getElementById($(this).find('a').first().text() + "_eventPopUp").style.display = "inline";
				});

			$('.divDatePicker .ui-datepicker-calendar a')
				.filter(function(index)
				{
					return $(this).text() == eventDate.getDate() &&
						$(this).parent('td').attr("data-year") == eventDate.getFullYear() &&
						$(this).parent('td').attr("data-month") == eventDate.getMonth();
				}).parent('td').mouseout(function()
				{
					document.getElementById($(this).find('a').first().text() + "_eventPopUp").style.display = "none";
				});

			calliHtml = '<li class="divCalendarLI"><a class="anchCalLi" href="' + itemURL + '">' + title + '</a> ' + eventDuration + '</li>';
			$(".divDatePicker #" + eventDate.getDate() + "_eventPopUp").append("<h3 class='calHead'>" + eventDate.toLocaleDateString() + "</h3 >");
			$(".divDatePicker #" + eventDate.getDate() + "_eventPopUp").append("<ul class = 'divCalendarUL'>");
			$(".divDatePicker #" + eventDate.getDate() + "_eventPopUp" + " .divCalendarUL").append(calliHtml);
		}

		function getFormattedTime(eventDate)
		{
			currentTime = new Date(eventDate.substring(0, 4), eventDate.substring(5, 7) - 1, eventDate.substring(8, 10), eventDate.substring(11, 13), eventDate.substring(14, 16), eventDate.substring(17, 19));
			hours = currentTime.getHours();
			minutes = currentTime.getMinutes();
			if (minutes < 10)
			{
				minutes = "0" + minutes;
			}
			if (hours > 11)
			{
				if (hours > 12)
				{
					return (hours - 12) + ":" + minutes + " " + "PM";
				}
				else
				{
					return hours + ":" + minutes + " " + "PM";
				}
			}
			else
			{
				return hours + ":" + minutes + " " + "AM";
			}
		}

	})(jQuery);
</script>

<div class="divDatePicker"></div>


<style type="text/css">
	.divDatePicker .eventPopUpDiv {
		Z-INDEX: 9002;
		PADDING-RIGHT: 10px;
		BORDER-BOTTOM: black 1px solid;
		POSITION: absolute;
		BORDER-LEFT: black 1px solid;
		BACKGROUND-COLOR: white;
		BORDER-TOP: black 1px solid;
		BORDER-RIGHT: black 1px solid
	}
	
	.divDatePicker .CalendarLI {
		MARGIN-LEFT: -23px;
		FONT-WEIGHT: normal
	}
	
	.divDatePicker .divCalendarLI {
		MARGIN-LEFT: -23px
	}
	
	.divDatePicker .calHead {
		PADDING-LEFT: 4px;
		PADDING-RIGHT: 4px;
		FONT-SIZE: 8pt !important;
		FONT-WEIGHT: bold !important
	}
	
	.divDatePicker .anchCalLi {

		TEXT-ALIGN: left !important;
	}
	
	.divDatePicker .anchCalLi:hover {
		text-decoration: underline !important;
		BORDER-RIGHT-WIDTH: 0px;
		BACKGROUND: none transparent scroll repeat 0% 0%;
		BORDER-TOP-WIDTH: 0px;
		BORDER-BOTTOM-WIDTH: 0px;
		BORDER-LEFT-WIDTH: 0px;
		FONT-WEIGHT: normal !important
	}
	
	.divDatePicker .anchCalLi:visited {
		text-decoration: none;
		color: rgb(0, 114, 188) !important;
	}
	
	.divDatePicker .ui-state-default:visited {
		text-decoration: none;
		color: rgb(0, 114, 188) !important;
	}
	.divDatePicker .ui-widget-header .ui-icon {
	  background-image: url("/ui-icons_222222_256x240.png);
	}
</style>