/*global story, jQuery, document, module, test, same */ 
jQuery(document).ready(function () {
    module("FormatUTCStringPlugin");

    test("Missing Tiddler", function () {

        same(new Date(Date.UTC(2008,11,31,9,48)).formatUTCString("0hh12"), "09",
            '12-hour format (with zero-padding) should return correct result for AM times');
        same(new Date(Date.UTC(2008,11,31,21,48)).formatUTCString("0hh12"), "09",
            '12-hour format (with zero-padding) should return correct result for PM times');
        same(new Date(Date.UTC(2008,11,31,9,48)).formatUTCString("hh12"), "9",
            '12-hour format (without zero-padding) should return correct result for AM times');
        same(new Date(Date.UTC(2008,11,31,21,48)).formatUTCString("hh12"), "9",
            '12-hour format (without zero-padding) should return correct result for PM times');
        same(new Date(Date.UTC(2008,11,31,9,48)).formatUTCString("0hh"), "09",
            '24-hour format (with zero-padding) should return correct result for AM times');
        same(new Date(Date.UTC(2008,11,31,21,48)).formatUTCString("0hh"), "21",
            '24-hour format (with zero-padding) should return correct result for PM times');
        same(new Date(Date.UTC(2008,11,31,9,48)).formatUTCString("hh"), "9",
            '24-hour format (without zero-padding) should return correct result for AM times');
        same(new Date(Date.UTC(2008,11,31,21,48)).formatUTCString("hh"), "21",
            '24-hour format (without zero-padding) should return correct result for PM times');
        same(new Date(Date.UTC(2008,0)).formatUTCString("mmm"), "Jan",
             'short-month format should return "Jan" for month 0');
        same(new Date(Date.UTC(2008,1)).formatUTCString("mmm"), "Feb",
            'short-month format should return "Feb" for month 1');
        same(new Date(Date.UTC(2008,2)).formatUTCString("mmm"), "Mar",
            'short-month format should return "Mar" for month 2');
        same(new Date(Date.UTC(2008,3)).formatUTCString("mmm"), "Apr",
            'short-month format should return "Apr" for month 3');
        same(new Date(Date.UTC(2008,4)).formatUTCString("mmm"), "May",
            'short-month format should return "May" for month 4');
        same(new Date(Date.UTC(2008,5)).formatUTCString("mmm"), "Jun",
            'short-month format should return "Jun" for month 5');
        same(new Date(Date.UTC(2008,6)).formatUTCString("mmm"), "Jul",
            'short-month format should return "Jul" for month 6');
        same(new Date(Date.UTC(2008,7)).formatUTCString("mmm"), "Aug",
            'short-month format should return "Aug" for month 7');
        same(new Date(Date.UTC(2008,8)).formatUTCString("mmm"), "Sep",
            'short-month format should return "Sep" for month 8');
        same(new Date(Date.UTC(2008,9)).formatUTCString("mmm"), "Oct",
            'short-month format should return "Oct" for month 9');
        same(new Date(Date.UTC(2008,10)).formatUTCString("mmm"), "Nov",
            'short-month format should return "Nov" for month 10');
        same(new Date(Date.UTC(2008,11)).formatUTCString("mmm"), "Dec",
            'short-month format should return "Dec" for month 12');

        same(new Date(Date.UTC(2008,11,15,11,0)).formatUTCString("0mm"), "00",
            'minutes format (with zero-padding) should return "00" for minute 0');
        same(new Date(Date.UTC(2008,11,15,11,5)).formatUTCString("0mm"), "05",
            'minutes format (with zero-padding) should return "05" for minute 5');
        same(new Date(Date.UTC(2008,11,15,11,30)).formatUTCString("0mm"), "30",
            'minutes format (with zero-padding) should return "30" for minute 30');
        same(new Date(Date.UTC(2008,11,15,11,60)).formatUTCString("0mm"), "00",
            'minutes format (with zero-padding) should return "00" for minute 60');
        same(new Date(Date.UTC(2008,11,15,11,0)).formatUTCString("mm"), "0",
            'minutes format (without zero-padding) should return "0" for minute 0');
        same(new Date(Date.UTC(2008,11,15,11,5)).formatUTCString("mm"), "5",
            'minutes format (without zero-padding) should return "5" for minute 5');
        same(new Date(Date.UTC(2008,11,15,11,30)).formatUTCString("mm"), "30",
            'minutes format (without zero-padding) should return "30" for minute 30');
        same(new Date(Date.UTC(2008,11,15,11,60)).formatUTCString("mm"), "0",
            'minutes format (without zero-padding) should return "0" for minute 60');

        same(new Date(Date.UTC(2008,11,15,11,1,0)).formatUTCString("0ss"), "00",
            'seconds format (with zero-padding) should return "00" for second 0');
        same(new Date(Date.UTC(2008,11,15,11,1,5)).formatUTCString("0ss"), "05",
            'seconds format (with zero-padding) should return "05" for second 5');
        same(new Date(Date.UTC(2008,11,15,11,1,30)).formatUTCString("0ss"), "30",
            'seconds format (with zero-padding) should return "30" for second 30');
        same(new Date(Date.UTC(2008,11,15,11,1,60)).formatUTCString("0ss"), "00",
            'seconds format (with zero-padding) should return "00" for second 60');
        same(new Date(Date.UTC(2008,11,15,11,1,0)).formatUTCString("ss"), "0",
            'seconds format (without zero-padding) should return "0" for second 0');
        same(new Date(Date.UTC(2008,11,15,11,1,5)).formatUTCString("ss"), "5",
            'seconds format (without zero-padding) should return "5" for second 5');
        same(new Date(Date.UTC(2008,11,15,11,1,30)).formatUTCString("ss"), "30",
            'seconds format (without zero-padding) should return "30" for second 30');
        same(new Date(Date.UTC(2008,11,15,11,1,60)).formatUTCString("ss"), "0",
            'seconds format (without zero-padding) should return "0" for second 60');

        same(new Date(Date.UTC(2008,11,15,0)).formatUTCString("am"), "am",
            'am format should return "am" for pre-noon times (00:00:00)');
        same(new Date(Date.UTC(2008,11,15,8)).formatUTCString("am"), "am",
            'am format should return "am" for pre-noon times (08:00:00)');
        same(new Date(Date.UTC(2008,11,15,11,59,59)).formatUTCString("am"), "am",
            'am format should return "am" for pre-noon times (11:59:59)');
        same(new Date(Date.UTC(2008,11,15,0)).formatUTCString("pm"), "am",
            'pm format should return "am" for pre-noon times (00:00:00)');
        same(new Date(Date.UTC(2008,11,15,8)).formatUTCString("pm"), "am",
            'pm format should return "am" for pre-noon times (08:00:00)');
        same(new Date(Date.UTC(2008,11,15,11,59,59)).formatUTCString("pm"), "am",
            'pm format should return "am" for pre-noon times (11:59:59)');
        same(new Date(Date.UTC(2008,11,15,12)).formatUTCString("am"), "pm",
            'am format should return "pm" for pre-midnight times (12:00:00)');
        same(new Date(Date.UTC(2008,11,15,20)).formatUTCString("am"), "pm",
            'am format should return "pm" for pre-midnight times (20:00:00)');
        same(new Date(Date.UTC(2008,11,15,23,59,59)).formatUTCString("am"), "pm",
            'am format should return "pm" for pre-midnight times (23:59:59)');
        same(new Date(Date.UTC(2008,11,15,12)).formatUTCString("pm"), "pm",
            'pm format should return "pm" for pre-midnight times (12:00:00)');
        same(new Date(Date.UTC(2008,11,15,20)).formatUTCString("pm"), "pm",
            'pm format should return "pm" for pre-midnight times (20:00:00)');
        same(new Date(Date.UTC(2008,11,15,23,59,59)).formatUTCString("pm"), "pm",
            'pm format should return "pm" for pre-midnight times (23:59:59)');

        same(new Date(Date.UTC(2008,11,15,0)).formatUTCString("AM"), "AM",
            'AM format should return "AM" for pre-noon times (00:00:00)');
        same(new Date(Date.UTC(2008,11,15,8)).formatUTCString("AM"), "AM",
            'AM format should return "AM" for pre-noon times (08:00:00)');
        same(new Date(Date.UTC(2008,11,15,11,59,59)).formatUTCString("AM"), "AM",
            'AM format should return "AM" for pre-noon times (11:59:59)');
        same(new Date(Date.UTC(2008,11,15,0)).formatUTCString("PM"), "AM",
            'PM format should return "AM" for pre-noon times (00:00:00)');
        same(new Date(Date.UTC(2008,11,15,8)).formatUTCString("PM"), "AM",
            'PM format should return "AM" for pre-noon times (08:00:00)');
        same(new Date(Date.UTC(2008,11,15,11,59,59)).formatUTCString("PM"), "AM",
            'PM format should return "AM" for pre-noon times (11:59:59)');
        same(new Date(Date.UTC(2008,11,15,12)).formatUTCString("AM"), "PM",
            'AM format should return "PM" for pre-midnight times (12:00:00)');
        same(new Date(Date.UTC(2008,11,15,20)).formatUTCString("AM"), "PM",
            'AM format should return "PM" for pre-midnight times (20:00:00)');
        same(new Date(Date.UTC(2008,11,15,23,59,59)).formatUTCString("AM"), "PM",
            'AM format should return "PM" for pre-midnight times (23:59:59)');
        same(new Date(Date.UTC(2008,11,15,12)).formatUTCString("PM"), "PM",
            'PM format should return "PM" for pre-midnight times (12:00:00)');
        same(new Date(Date.UTC(2008,11,15,20)).formatUTCString("PM"), "PM",
            'PM format should return "PM" for pre-midnight times (20:00:00)');
        same(new Date(Date.UTC(2008,11,15,23,59,59)).formatUTCString("PM"), "PM",
            'PM format should return "PM" for pre-midnight times (23:59:59)');

        same(new Date(Date.UTC(2007,11,31)).formatUTCString("wYYYY"), "2008",
            'week-based four-digit year format should return the year based on the week number');
        same(new Date(Date.UTC(2007,11,31)).formatUTCString("wYY"), "08",
            'week-based two-digit year format should return the year based on the week number');
        same(new Date(Date.UTC(2007,11,31)).formatUTCString("YYYY"), "2007",
            'four-digit year format should return the correct year');
        same(new Date(Date.UTC(7,11,31)).formatUTCString("YYYY"), "1907",
            'four-digit year format should return the correct year based on 20th century');
        same(new Date(Date.UTC(2007,11,31)).formatUTCString("YY"), "07",
            'two-digit year format should return the correct year');

        same(new Date(Date.UTC(2008,0)).formatUTCString("MMM"), "January",
            'full-month format should return "January" for month 0');
        same(new Date(Date.UTC(2008,1)).formatUTCString("MMM"), "February",
            'full-month format should return "February" for month 1');
        same(new Date(Date.UTC(2008,2)).formatUTCString("MMM"), "March",
            'full-month format should return "March" for month 2');
        same(new Date(Date.UTC(2008,3)).formatUTCString("MMM"), "April",
            'full-month format should return "April" for month 3');
        same(new Date(Date.UTC(2008,4)).formatUTCString("MMM"), "May",
            'full-month format should return "May" for month 4');
        same(new Date(Date.UTC(2008,5)).formatUTCString("MMM"), "June",
            'full-month format should return "June" for month 5');
        same(new Date(Date.UTC(2008,6)).formatUTCString("MMM"), "July",
            'full-month format should return "July" for month 6');
        same(new Date(Date.UTC(2008,7)).formatUTCString("MMM"), "August",
            'full-month format should return "August" for month 7');
        same(new Date(Date.UTC(2008,8)).formatUTCString("MMM"), "September",
            'full-month format should return "September" for month 8');
        same(new Date(Date.UTC(2008,9)).formatUTCString("MMM"), "October",
            'full-month format should return "October" for month 9');
        same(new Date(Date.UTC(2008,10)).formatUTCString("MMM"), "November",
            'full-month format should return "November" for month 10');
        same(new Date(Date.UTC(2008,11)).formatUTCString("MMM"), "December",
            'full-month format should return "December" for month 12');

        same(new Date(Date.UTC(2008,0)).formatUTCString("0MM"), "01",
            'months format (with zero-padding) should return "01" for January');
        same(new Date(Date.UTC(2008,11)).formatUTCString("0MM"), "12",
            'months format (with zero-padding) should return "12" for December');
        same(new Date(Date.UTC(2008,12)).formatUTCString("0MM"), "01",
            'months format (with zero-padding) should return "01" for month 13');
        same(new Date(Date.UTC(2008,0)).formatUTCString("MM"), "1",
            'months format (without zero-padding) should return "1" for January');
        same(new Date(Date.UTC(2008,11)).formatUTCString("MM"), "12",
            'months format (without zero-padding) should return "12" for December');
        same(new Date(Date.UTC(2008,12)).formatUTCString("MM"), "1",
            'months format (without zero-padding) should return "1" for month 13');

        same(new Date(Date.UTC(2008,0,1)).formatUTCString("0WW"), "01",
            'weeks format (with zero-padding) should return "01" for the first day of the year');

        same(new Date(Date.UTC(2008,11,28)).formatUTCString("0WW"), "52",
            'weeks format (with zero-padding) should return "52" for the last Sunday of the year');
        same(new Date(Date.UTC(2008,0,1)).formatUTCString("WW"), "1",
            'weeks format (without zero-padding) should return "1" for the first day of the year');
        same(new Date(Date.UTC(2008,11,28)).formatUTCString("WW"), "52",
            'weeks format (without zero-padding) should return "52" for the last Sunday of the year');

        same(new Date(Date.UTC(2008,0,7)).formatUTCString("DDD"), "Monday",
            'full-day format should return "Monday" for the first day of the week');
        same(new Date(Date.UTC(2008,0,8)).formatUTCString("DDD"), "Tuesday",
            'full-day format should return "Tuesday" for the second day of the week');
        same(new Date(Date.UTC(2008,0,9)).formatUTCString("DDD"), "Wednesday",
            'full-day format should return "Wednesday" for the third day of the week');
        same(new Date(Date.UTC(2008,0,10)).formatUTCString("DDD"), "Thursday",
            'full-day format should return "Thursday" for the fourth day of the week');
        same(new Date(Date.UTC(2008,0,11)).formatUTCString("DDD"), "Friday",
            'full-day format should return "Friday" for the fifth day of the week');
        same(new Date(Date.UTC(2008,0,12)).formatUTCString("DDD"), "Saturday",
            'full-day format should return "Saturday" for the sixth day of the week');
        same(new Date(Date.UTC(2008,0,13)).formatUTCString("DDD"), "Sunday",
            'full-day format should return "Sunday" for the seventh day of the week');

        same(new Date(Date.UTC(2008,0,7)).formatUTCString("ddd"), "Mon",
            'short-day format should return "Mon" for the first day of the week');
        same(new Date(Date.UTC(2008,0,8)).formatUTCString("ddd"), "Tue",
            'short-day format should return "Tue" for the second day of the week');
        same(new Date(Date.UTC(2008,0,9)).formatUTCString("ddd"), "Wed",
            'short-day format should return "Wed" for the third day of the week');
        same(new Date(Date.UTC(2008,0,10)).formatUTCString("ddd"), "Thu",
            'short-day format should return "Thu" for the fourth day of the week');
        same(new Date(Date.UTC(2008,0,11)).formatUTCString("ddd"), "Fri",
            'short-day format should return "Fri" for the fifth day of the week');
        same(new Date(Date.UTC(2008,0,12)).formatUTCString("ddd"), "Sat",
            'short-day format should return "Sat" for the sixth day of the week');
        same(new Date(Date.UTC(2008,0,13)).formatUTCString("ddd"), "Sun",
            'short-day format should return "Sun" for the seventh day of the week');

        same(new Date(Date.UTC(2008,5,1)).formatUTCString("0DD"), "01",
            'days format (with zero-padding) should return "01" for the first day of the month');
        same(new Date(Date.UTC(2008,0,31)).formatUTCString("0DD"), "31",
            'days format (with zero-padding) should return "31" for January 31');
        same(new Date(Date.UTC(2008,0,32)).formatUTCString("0DD"), "01",
            'days format (with zero-padding) should return "01" for January 32 [sic]');
        same(new Date(Date.UTC(2008,1,29)).formatUTCString("0DD"), "29",
            'days format (with zero-padding) should return "29" for February 29, 2008');
        same(new Date(Date.UTC(2009,1,29)).formatUTCString("0DD"), "01",
            'days format (with zero-padding) should return "01" for February 29 [sic], 2009');

        same(new Date(Date.UTC(2008,5,1)).formatUTCString("DD"), "1",
            'days format (without zero-padding) should return "1" for the first day of the month');
        same(new Date(Date.UTC(2008,0,31)).formatUTCString("DD"), "31",
            'days format (without zero-padding) should return "31" for January 31');
        same(new Date(Date.UTC(2008,0,32)).formatUTCString("DD"), "1",
            'days format (without zero-padding) should return "1" for January 32 [sic]');
        same(new Date(Date.UTC(2008,1,29)).formatUTCString("DD"), "29",
            'days format (without zero-padding) should return "29" for February 29, 2008');
        same(new Date(Date.UTC(2009,1,29)).formatUTCString("DD"), "1",
            'days format (without zero-padding) should return "1" for February 29 [sic], 2009');

        same(new Date(Date.UTC(2008,5,1)).formatUTCString("DDth"), "1st",
            'day-with-suffix format should return "1st" for the first day of the month');
        same(new Date(Date.UTC(2008,5,2)).formatUTCString("DDth"), "2nd",
            'day-with-suffix format should return "2nd" for the second day of the month');
        same(new Date(Date.UTC(2008,5,3)).formatUTCString("DDth"), "3rd",
            'day-with-suffix format should return "3rd" for the third day of the month');
        same(new Date(Date.UTC(2008,5,4)).formatUTCString("DDth"), "4th",
            'day-with-suffix format should return "4th" for the fourth day of the month');
        same(new Date(Date.UTC(2008,5,11)).formatUTCString("DDth"), "11th",
            'day-with-suffix format should return "11th" for the eleventh day of the month');
        same(new Date(Date.UTC(2008,5,21)).formatUTCString("DDth"), "21st",
            'day-with-suffix format should return "21st" for the twenty-first day of the month');
        same(new Date(Date.UTC(2008,5,22)).formatUTCString("DDth"), "22nd",
            'day-with-suffix format should return "22nd" for the twenty-second day of the month');
        same(new Date(Date.UTC(2008,5,23)).formatUTCString("DDth"), "23rd",
            'day-with-suffix format should return "23rd" for the twenty-third day of the month');
        same(new Date(Date.UTC(2008,5,24)).formatUTCString("DDth"), "24th",
            'day-with-suffix format should return "24th" for the twenty-fourth day of the month');
        same(new Date(Date.UTC(2008,0,32)).formatUTCString("DDth"), "1st", 
            'day-with-suffix format should return "1st" for the January 32 [sic]');
    });

});
