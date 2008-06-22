// <![CDATA[

function __main() {
	store = new TiddlyWiki();
	loadShadowTiddlers();
	store.loadFromDiv("storeArea","store",true);
	loadPlugins();
}

describe('Date.convertFromYYYYMMDDHHMMSSMMM', {
        before_each : function() {
		__main();
        },
	'12-hour format (with zero-padding) should return correct result for AM times': function() {
		var actual = new Date(Date.UTC(2008,11,31,9,48)).formatUTCString("0hh12");
		var expected = "09";
		value_of(actual).should_be(expected);
	},
	'12-hour format (with zero-padding) should return correct result for PM times': function() {
		var actual = new Date(Date.UTC(2008,11,31,21,48)).formatUTCString("0hh12");
		var expected = "09";
		value_of(actual).should_be(expected);
	},
	'12-hour format (without zero-padding) should return correct result for AM times': function() {
		var actual = new Date(Date.UTC(2008,11,31,9,48)).formatUTCString("hh12");
		var expected = "9";
		value_of(actual).should_be(expected);
	},
	'12-hour format (without zero-padding) should return correct result for PM times': function() {
		var actual = new Date(Date.UTC(2008,11,31,21,48)).formatUTCString("hh12");
		var expected = "9";
		value_of(actual).should_be(expected);
	},

	'24-hour format (with zero-padding) should return correct result for AM times': function() {
		var actual = new Date(Date.UTC(2008,11,31,9,48)).formatUTCString("0hh");
		var expected = "09";
		value_of(actual).should_be(expected);
	},
	'24-hour format (with zero-padding) should return correct result for PM times': function() {
		var actual = new Date(Date.UTC(2008,11,31,21,48)).formatUTCString("0hh");
		var expected = "21";
		value_of(actual).should_be(expected);
	},
	'24-hour format (without zero-padding) should return correct result for AM times': function() {
		var actual = new Date(Date.UTC(2008,11,31,9,48)).formatUTCString("hh");
		var expected = "9";
		value_of(actual).should_be(expected);
	},
	'24-hour format (without zero-padding) should return correct result for PM times': function() {
		var actual = new Date(Date.UTC(2008,11,31,21,48)).formatUTCString("hh");
		var expected = "21";
		value_of(actual).should_be(expected);
	},

	'short-month format should return "Jan" for month 0': function() {
		var actual = new Date(Date.UTC(2008,0)).formatUTCString("mmm");
		var expected = "Jan";
		value_of(actual).should_be(expected);
	},
	'short-month format should return "Feb" for month 1': function() {
		var actual = new Date(Date.UTC(2008,1)).formatUTCString("mmm");
		var expected = "Feb";
		value_of(actual).should_be(expected);
	},
	'short-month format should return "Mar" for month 2': function() {
		var actual = new Date(Date.UTC(2008,2)).formatUTCString("mmm");
		var expected = "Mar";
		value_of(actual).should_be(expected);
	},
	'short-month format should return "Apr" for month 3': function() {
		var actual = new Date(Date.UTC(2008,3)).formatUTCString("mmm");
		var expected = "Apr";
		value_of(actual).should_be(expected);
	},
	'short-month format should return "May" for month 4': function() {
		var actual = new Date(Date.UTC(2008,4)).formatUTCString("mmm");
		var expected = "May";
		value_of(actual).should_be(expected);
	},
	'short-month format should return "Jun" for month 5': function() {
		var actual = new Date(Date.UTC(2008,5)).formatUTCString("mmm");
		var expected = "Jun";
		value_of(actual).should_be(expected);
	},
	'short-month format should return "Jul" for month 6': function() {
		var actual = new Date(Date.UTC(2008,6)).formatUTCString("mmm");
		var expected = "Jul";
		value_of(actual).should_be(expected);
	},
	'short-month format should return "Aug" for month 7': function() {
		var actual = new Date(Date.UTC(2008,7)).formatUTCString("mmm");
		var expected = "Aug";
		value_of(actual).should_be(expected);
	},
	'short-month format should return "Sep" for month 8': function() {
		var actual = new Date(Date.UTC(2008,8)).formatUTCString("mmm");
		var expected = "Sep";
		value_of(actual).should_be(expected);
	},
	'short-month format should return "Oct" for month 9': function() {
		var actual = new Date(Date.UTC(2008,9)).formatUTCString("mmm");
		var expected = "Oct";
		value_of(actual).should_be(expected);
	},
	'short-month format should return "Nov" for month 10': function() {
		var actual = new Date(Date.UTC(2008,10)).formatUTCString("mmm");
		var expected = "Nov";
		value_of(actual).should_be(expected);
	},
	'short-month format should return "Dec" for month 12': function() {
		var actual = new Date(Date.UTC(2008,11)).formatUTCString("mmm");
		var expected = "Dec";
		value_of(actual).should_be(expected);
	},

	'minutes format (with zero-padding) should return "00" for minute 0': function() {
		var actual = new Date(Date.UTC(2008,11,15,11,0)).formatUTCString("0mm");
		var expected = "00";
		value_of(actual).should_be(expected);
	},
	'minutes format (with zero-padding) should return "05" for minute 5': function() {
		var actual = new Date(Date.UTC(2008,11,15,11,5)).formatUTCString("0mm");
		var expected = "05";
		value_of(actual).should_be(expected);
	},
	'minutes format (with zero-padding) should return "30" for minute 30': function() {
		var actual = new Date(Date.UTC(2008,11,15,11,30)).formatUTCString("0mm");
		var expected = "30";
		value_of(actual).should_be(expected);
	},
	'minutes format (with zero-padding) should return "00" for minute 60': function() {
		var actual = new Date(Date.UTC(2008,11,15,11,60)).formatUTCString("0mm");
		var expected = "00";
		value_of(actual).should_be(expected);
	},
	'minutes format (without zero-padding) should return "0" for minute 0': function() {
		var actual = new Date(Date.UTC(2008,11,15,11,0)).formatUTCString("mm");
		var expected = "0";
		value_of(actual).should_be(expected);
	},
	'minutes format (without zero-padding) should return "5" for minute 5': function() {
		var actual = new Date(Date.UTC(2008,11,15,11,5)).formatUTCString("mm");
		var expected = "5";
		value_of(actual).should_be(expected);
	},
	'minutes format (without zero-padding) should return "30" for minute 30': function() {
		var actual = new Date(Date.UTC(2008,11,15,11,30)).formatUTCString("mm");
		var expected = "30";
		value_of(actual).should_be(expected);
	},
	'minutes format (without zero-padding) should return "0" for minute 60': function() {
		var actual = new Date(Date.UTC(2008,11,15,11,60)).formatUTCString("mm");
		var expected = "0";
		value_of(actual).should_be(expected);
	},

	'seconds format (with zero-padding) should return "00" for second 0': function() {
		var actual = new Date(Date.UTC(2008,11,15,11,1,0)).formatUTCString("0ss");
		var expected = "00";
		value_of(actual).should_be(expected);
	},
	'seconds format (with zero-padding) should return "05" for second 5': function() {
		var actual = new Date(Date.UTC(2008,11,15,11,1,5)).formatUTCString("0ss");
		var expected = "05";
		value_of(actual).should_be(expected);
	},
	'seconds format (with zero-padding) should return "30" for second 30': function() {
		var actual = new Date(Date.UTC(2008,11,15,11,1,30)).formatUTCString("0ss");
		var expected = "30";
		value_of(actual).should_be(expected);
	},
	'seconds format (with zero-padding) should return "00" for second 60': function() {
		var actual = new Date(Date.UTC(2008,11,15,11,1,60)).formatUTCString("0ss");
		var expected = "00";
		value_of(actual).should_be(expected);
	},
	'seconds format (without zero-padding) should return "0" for second 0': function() {
		var actual = new Date(Date.UTC(2008,11,15,11,1,0)).formatUTCString("ss");
		var expected = "0";
		value_of(actual).should_be(expected);
	},
	'seconds format (without zero-padding) should return "5" for second 5': function() {
		var actual = new Date(Date.UTC(2008,11,15,11,1,5)).formatUTCString("ss");
		var expected = "5";
		value_of(actual).should_be(expected);
	},
	'seconds format (without zero-padding) should return "30" for second 30': function() {
		var actual = new Date(Date.UTC(2008,11,15,11,1,30)).formatUTCString("ss");
		var expected = "30";
		value_of(actual).should_be(expected);
	},
	'seconds format (without zero-padding) should return "0" for second 60': function() {
		var actual = new Date(Date.UTC(2008,11,15,11,1,60)).formatUTCString("ss");
		var expected = "0";
		value_of(actual).should_be(expected);
	},

	'am format should return "am" for pre-noon times (00:00:00)': function() {
		var actual = new Date(Date.UTC(2008,11,15,0)).formatUTCString("am");
		var expected = "am";
		value_of(actual).should_be(expected);
	},
	'am format should return "am" for pre-noon times (08:00:00)': function() {
		var actual = new Date(Date.UTC(2008,11,15,8)).formatUTCString("am");
		var expected = "am";
		value_of(actual).should_be(expected);
	},
	'am format should return "am" for pre-noon times (11:59:59)': function() {
		var actual = new Date(Date.UTC(2008,11,15,11,59,59)).formatUTCString("am");
		var expected = "am";
		value_of(actual).should_be(expected);
	},
	'pm format should return "am" for pre-noon times (00:00:00)': function() {
		var actual = new Date(Date.UTC(2008,11,15,0)).formatUTCString("pm");
		var expected = "am";
		value_of(actual).should_be(expected);
	},
	'pm format should return "am" for pre-noon times (08:00:00)': function() {
		var actual = new Date(Date.UTC(2008,11,15,8)).formatUTCString("pm");
		var expected = "am";
		value_of(actual).should_be(expected);
	},
	'pm format should return "am" for pre-noon times (11:59:59)': function() {
		var actual = new Date(Date.UTC(2008,11,15,11,59,59)).formatUTCString("pm");
		var expected = "am";
		value_of(actual).should_be(expected);
	},
	'am format should return "pm" for pre-midnight times (12:00:00)': function() {
		var actual = new Date(Date.UTC(2008,11,15,12)).formatUTCString("am");
		var expected = "pm";
		value_of(actual).should_be(expected);
	},
	'am format should return "pm" for pre-midnight times (20:00:00)': function() {
		var actual = new Date(Date.UTC(2008,11,15,20)).formatUTCString("am");
		var expected = "pm";
		value_of(actual).should_be(expected);
	},
	'am format should return "pm" for pre-midnight times (23:59:59)': function() {
		var actual = new Date(Date.UTC(2008,11,15,23,59,59)).formatUTCString("am");
		var expected = "pm";
		value_of(actual).should_be(expected);
	},
	'pm format should return "pm" for pre-midnight times (12:00:00)': function() {
		var actual = new Date(Date.UTC(2008,11,15,12)).formatUTCString("pm");
		var expected = "pm";
		value_of(actual).should_be(expected);
	},
	'pm format should return "pm" for pre-midnight times (20:00:00)': function() {
		var actual = new Date(Date.UTC(2008,11,15,20)).formatUTCString("pm");
		var expected = "pm";
		value_of(actual).should_be(expected);
	},
	'pm format should return "pm" for pre-midnight times (23:59:59)': function() {
		var actual = new Date(Date.UTC(2008,11,15,23,59,59)).formatUTCString("pm");
		var expected = "pm";
		value_of(actual).should_be(expected);
	},

	'AM format should return "AM" for pre-noon times (00:00:00)': function() {
		var actual = new Date(Date.UTC(2008,11,15,0)).formatUTCString("AM");
		var expected = "AM";
		value_of(actual).should_be(expected);
	},
	'AM format should return "AM" for pre-noon times (08:00:00)': function() {
		var actual = new Date(Date.UTC(2008,11,15,8)).formatUTCString("AM");
		var expected = "AM";
		value_of(actual).should_be(expected);
	},
	'AM format should return "AM" for pre-noon times (11:59:59)': function() {
		var actual = new Date(Date.UTC(2008,11,15,11,59,59)).formatUTCString("AM");
		var expected = "AM";
		value_of(actual).should_be(expected);
	},
	'PM format should return "AM" for pre-noon times (00:00:00)': function() {
		var actual = new Date(Date.UTC(2008,11,15,0)).formatUTCString("PM");
		var expected = "AM";
		value_of(actual).should_be(expected);
	},
	'PM format should return "AM" for pre-noon times (08:00:00)': function() {
		var actual = new Date(Date.UTC(2008,11,15,8)).formatUTCString("PM");
		var expected = "AM";
		value_of(actual).should_be(expected);
	},
	'PM format should return "AM" for pre-noon times (11:59:59)': function() {
		var actual = new Date(Date.UTC(2008,11,15,11,59,59)).formatUTCString("PM");
		var expected = "AM";
		value_of(actual).should_be(expected);
	},
	'AM format should return "PM" for pre-midnight times (12:00:00)': function() {
		var actual = new Date(Date.UTC(2008,11,15,12)).formatUTCString("AM");
		var expected = "PM";
		value_of(actual).should_be(expected);
	},
	'AM format should return "PM" for pre-midnight times (20:00:00)': function() {
		var actual = new Date(Date.UTC(2008,11,15,20)).formatUTCString("AM");
		var expected = "PM";
		value_of(actual).should_be(expected);
	},
	'AM format should return "PM" for pre-midnight times (23:59:59)': function() {
		var actual = new Date(Date.UTC(2008,11,15,23,59,59)).formatUTCString("AM");
		var expected = "PM";
		value_of(actual).should_be(expected);
	},
	'PM format should return "PM" for pre-midnight times (12:00:00)': function() {
		var actual = new Date(Date.UTC(2008,11,15,12)).formatUTCString("PM");
		var expected = "PM";
		value_of(actual).should_be(expected);
	},
	'PM format should return "PM" for pre-midnight times (20:00:00)': function() {
		var actual = new Date(Date.UTC(2008,11,15,20)).formatUTCString("PM");
		var expected = "PM";
		value_of(actual).should_be(expected);
	},
	'PM format should return "PM" for pre-midnight times (23:59:59)': function() {
		var actual = new Date(Date.UTC(2008,11,15,23,59,59)).formatUTCString("PM");
		var expected = "PM";
		value_of(actual).should_be(expected);
	},

	'week-based four-digit year format should return the year based on the week number': function() {
		var actual = new Date(Date.UTC(2007,11,31)).formatUTCString("wYYYY");
		var expected = "2008";
		value_of(actual).should_be(expected);
	},
	'week-based two-digit year format should return the year based on the week number': function() {
		var actual = new Date(Date.UTC(2007,11,31)).formatUTCString("wYY");
		var expected = "08";
		value_of(actual).should_be(expected);
	},
	'four-digit year format should return the correct year': function() {
		var actual = new Date(Date.UTC(2007,11,31)).formatUTCString("YYYY");
		var expected = "2007";
		value_of(actual).should_be(expected);
	},
	'four-digit year format should return the correct year based on 20th century': function() {
		var actual = new Date(Date.UTC(7,11,31)).formatUTCString("YYYY");
		var expected = "1907";
		value_of(actual).should_be(expected);
	},
	'two-digit year format should return the correct year': function() {
		var actual = new Date(Date.UTC(2007,11,31)).formatUTCString("YY");
		var expected = "07";
		value_of(actual).should_be(expected);
	},

	'full-month format should return "January" for month 0': function() {
		var actual = new Date(Date.UTC(2008,0)).formatUTCString("MMM");
		var expected = "January";
		value_of(actual).should_be(expected);
	},
	'full-month format should return "February" for month 1': function() {
		var actual = new Date(Date.UTC(2008,1)).formatUTCString("MMM");
		var expected = "February";
		value_of(actual).should_be(expected);
	},
	'full-month format should return "March" for month 2': function() {
		var actual = new Date(Date.UTC(2008,2)).formatUTCString("MMM");
		var expected = "March";
		value_of(actual).should_be(expected);
	},
	'full-month format should return "April" for month 3': function() {
		var actual = new Date(Date.UTC(2008,3)).formatUTCString("MMM");
		var expected = "April";
		value_of(actual).should_be(expected);
	},
	'full-month format should return "May" for month 4': function() {
		var actual = new Date(Date.UTC(2008,4)).formatUTCString("MMM");
		var expected = "May";
		value_of(actual).should_be(expected);
	},
	'full-month format should return "June" for month 5': function() {
		var actual = new Date(Date.UTC(2008,5)).formatUTCString("MMM");
		var expected = "June";
		value_of(actual).should_be(expected);
	},
	'full-month format should return "July" for month 6': function() {
		var actual = new Date(Date.UTC(2008,6)).formatUTCString("MMM");
		var expected = "July";
		value_of(actual).should_be(expected);
	},
	'full-month format should return "August" for month 7': function() {
		var actual = new Date(Date.UTC(2008,7)).formatUTCString("MMM");
		var expected = "August";
		value_of(actual).should_be(expected);
	},
	'full-month format should return "September" for month 8': function() {
		var actual = new Date(Date.UTC(2008,8)).formatUTCString("MMM");
		var expected = "September";
		value_of(actual).should_be(expected);
	},
	'full-month format should return "October" for month 9': function() {
		var actual = new Date(Date.UTC(2008,9)).formatUTCString("MMM");
		var expected = "October";
		value_of(actual).should_be(expected);
	},
	'full-month format should return "November" for month 10': function() {
		var actual = new Date(Date.UTC(2008,10)).formatUTCString("MMM");
		var expected = "November";
		value_of(actual).should_be(expected);
	},
	'full-month format should return "December" for month 12': function() {
		var actual = new Date(Date.UTC(2008,11)).formatUTCString("MMM");
		var expected = "December";
		value_of(actual).should_be(expected);
	},

	'months format (with zero-padding) should return "01" for January': function() {
		var actual = new Date(Date.UTC(2008,0)).formatUTCString("0MM");
		var expected = "01";
		value_of(actual).should_be(expected);
	},
	'months format (with zero-padding) should return "12" for December': function() {
		var actual = new Date(Date.UTC(2008,11)).formatUTCString("0MM");
		var expected = "12";
		value_of(actual).should_be(expected);
	},
	'months format (with zero-padding) should return "01" for month 13': function() {
		var actual = new Date(Date.UTC(2008,12)).formatUTCString("0MM");
		var expected = "01";
		value_of(actual).should_be(expected);
	},
	'months format (without zero-padding) should return "1" for January': function() {
		var actual = new Date(Date.UTC(2008,0)).formatUTCString("MM");
		var expected = "1";
		value_of(actual).should_be(expected);
	},
	'months format (without zero-padding) should return "12" for December': function() {
		var actual = new Date(Date.UTC(2008,11)).formatUTCString("MM");
		var expected = "12";
		value_of(actual).should_be(expected);
	},
	'months format (without zero-padding) should return "1" for month 13': function() {
		var actual = new Date(Date.UTC(2008,12)).formatUTCString("MM");
		var expected = "1";
		value_of(actual).should_be(expected);
	},

	'weeks format (with zero-padding) should return "01" for the first day of the year': function() {
		var actual = new Date(Date.UTC(2008,0,1)).formatUTCString("0WW");
		var expected = "01";
		value_of(actual).should_be(expected);
	},
	'weeks format (with zero-padding) should return "52" for the last Sunday of the year': function() {
		var actual = new Date(Date.UTC(2008,11,28)).formatUTCString("0WW");
		var expected = "52";
		value_of(actual).should_be(expected);
	},
	'weeks format (without zero-padding) should return "1" for the first day of the year': function() {
		var actual = new Date(Date.UTC(2008,0,1)).formatUTCString("WW");
		var expected = "1";
		value_of(actual).should_be(expected);
	},
	'weeks format (without zero-padding) should return "52" for the last Sunday of the year': function() {
		var actual = new Date(Date.UTC(2008,11,28)).formatUTCString("WW");
		var expected = "52";
		value_of(actual).should_be(expected);
	},

	'full-day format should return "Monday" for the first day of the week': function() {
		var actual = new Date(Date.UTC(2008,0,7)).formatUTCString("DDD");
		var expected = "Monday";
		value_of(actual).should_be(expected);
	},
	'full-day format should return "Tuesday" for the second day of the week': function() {
		var actual = new Date(Date.UTC(2008,0,8)).formatUTCString("DDD");
		var expected = "Tuesday";
		value_of(actual).should_be(expected);
	},
	'full-day format should return "Wednesday" for the third day of the week': function() {
		var actual = new Date(Date.UTC(2008,0,9)).formatUTCString("DDD");
		var expected = "Wednesday";
		value_of(actual).should_be(expected);
	},
	'full-day format should return "Thursday" for the fourth day of the week': function() {
		var actual = new Date(Date.UTC(2008,0,10)).formatUTCString("DDD");
		var expected = "Thursday";
		value_of(actual).should_be(expected);
	},
	'full-day format should return "Friday" for the fifth day of the week': function() {
		var actual = new Date(Date.UTC(2008,0,11)).formatUTCString("DDD");
		var expected = "Friday";
		value_of(actual).should_be(expected);
	},
	'full-day format should return "Saturday" for the sixth day of the week': function() {
		var actual = new Date(Date.UTC(2008,0,12)).formatUTCString("DDD");
		var expected = "Saturday";
		value_of(actual).should_be(expected);
	},
	'full-day format should return "Sunday" for the seventh day of the week': function() {
		var actual = new Date(Date.UTC(2008,0,13)).formatUTCString("DDD");
		var expected = "Sunday";
		value_of(actual).should_be(expected);
	},

	'short-day format should return "Mon" for the first day of the week': function() {
		var actual = new Date(Date.UTC(2008,0,7)).formatUTCString("ddd");
		var expected = "Mon";
		value_of(actual).should_be(expected);
	},
	'short-day format should return "Tue" for the second day of the week': function() {
		var actual = new Date(Date.UTC(2008,0,8)).formatUTCString("ddd");
		var expected = "Tue";
		value_of(actual).should_be(expected);
	},
	'short-day format should return "Wed" for the third day of the week': function() {
		var actual = new Date(Date.UTC(2008,0,9)).formatUTCString("ddd");
		var expected = "Wed";
		value_of(actual).should_be(expected);
	},
	'short-day format should return "Thu" for the fourth day of the week': function() {
		var actual = new Date(Date.UTC(2008,0,10)).formatUTCString("ddd");
		var expected = "Thu";
		value_of(actual).should_be(expected);
	},
	'short-day format should return "Fri" for the fifth day of the week': function() {
		var actual = new Date(Date.UTC(2008,0,11)).formatUTCString("ddd");
		var expected = "Fri";
		value_of(actual).should_be(expected);
	},
	'short-day format should return "Sat" for the sixth day of the week': function() {
		var actual = new Date(Date.UTC(2008,0,12)).formatUTCString("ddd");
		var expected = "Sat";
		value_of(actual).should_be(expected);
	},
	'short-day format should return "Sun" for the seventh day of the week': function() {
		var actual = new Date(Date.UTC(2008,0,13)).formatUTCString("ddd");
		var expected = "Sun";
		value_of(actual).should_be(expected);
	},

	'days format (with zero-padding) should return "01" for the first day of the month': function() {
		var actual = new Date(Date.UTC(2008,5,1)).formatUTCString("0DD");
		var expected = "01";
		value_of(actual).should_be(expected);
	},
	'days format (with zero-padding) should return "31" for January 31': function() {
		var actual = new Date(Date.UTC(2008,0,31)).formatUTCString("0DD");
		var expected = "31";
		value_of(actual).should_be(expected);
	},
	'days format (with zero-padding) should return "01" for January 32 [sic]': function() {
		var actual = new Date(Date.UTC(2008,0,32)).formatUTCString("0DD");
		var expected = "01";
		value_of(actual).should_be(expected);
	},
	'days format (with zero-padding) should return "29" for February 29, 2008': function() {
		var actual = new Date(Date.UTC(2008,1,29)).formatUTCString("0DD");
		var expected = "29";
		value_of(actual).should_be(expected);
	},
	'days format (with zero-padding) should return "01" for February 29 [sic], 2009': function() {
		var actual = new Date(Date.UTC(2009,1,29)).formatUTCString("0DD");
		var expected = "01";
		value_of(actual).should_be(expected);
	},

	'days format (without zero-padding) should return "1" for the first day of the month': function() {
		var actual = new Date(Date.UTC(2008,5,1)).formatUTCString("DD");
		var expected = "1";
		value_of(actual).should_be(expected);
	},
	'days format (without zero-padding) should return "31" for January 31': function() {
		var actual = new Date(Date.UTC(2008,0,31)).formatUTCString("DD");
		var expected = "31";
		value_of(actual).should_be(expected);
	},
	'days format (without zero-padding) should return "1" for January 32 [sic]': function() {
		var actual = new Date(Date.UTC(2008,0,32)).formatUTCString("DD");
		var expected = "1";
		value_of(actual).should_be(expected);
	},
	'days format (without zero-padding) should return "29" for February 29, 2008': function() {
		var actual = new Date(Date.UTC(2008,1,29)).formatUTCString("DD");
		var expected = "29";
		value_of(actual).should_be(expected);
	},
	'days format (without zero-padding) should return "1" for February 29 [sic], 2009': function() {
		var actual = new Date(Date.UTC(2009,1,29)).formatUTCString("DD");
		var expected = "1";
		value_of(actual).should_be(expected);
	},

	'day-with-suffix format should return "1st" for the first day of the month': function() {
		var actual = new Date(Date.UTC(2008,5,1)).formatUTCString("DDth");
		var expected = "1st";
		value_of(actual).should_be(expected);
	},
	'day-with-suffix format should return "2nd" for the second day of the month': function() {
		var actual = new Date(Date.UTC(2008,5,2)).formatUTCString("DDth");
		var expected = "2nd";
		value_of(actual).should_be(expected);
	},
	'day-with-suffix format should return "3rd" for the third day of the month': function() {
		var actual = new Date(Date.UTC(2008,5,3)).formatUTCString("DDth");
		var expected = "3rd";
		value_of(actual).should_be(expected);
	},
	'day-with-suffix format should return "4th" for the fourth day of the month': function() {
		var actual = new Date(Date.UTC(2008,5,4)).formatUTCString("DDth");
		var expected = "4th";
		value_of(actual).should_be(expected);
	},
	'day-with-suffix format should return "11th" for the eleventh day of the month': function() {
		var actual = new Date(Date.UTC(2008,5,11)).formatUTCString("DDth");
		var expected = "11th";
		value_of(actual).should_be(expected);
	},
	'day-with-suffix format should return "21st" for the twenty-first day of the month': function() {
		var actual = new Date(Date.UTC(2008,5,21)).formatUTCString("DDth");
		var expected = "21st";
		value_of(actual).should_be(expected);
	},
	'day-with-suffix format should return "22nd" for the twenty-second day of the month': function() {
		var actual = new Date(Date.UTC(2008,5,22)).formatUTCString("DDth");
		var expected = "22nd";
		value_of(actual).should_be(expected);
	},
	'day-with-suffix format should return "23rd" for the twenty-third day of the month': function() {
		var actual = new Date(Date.UTC(2008,5,23)).formatUTCString("DDth");
		var expected = "23rd";
		value_of(actual).should_be(expected);
	},	
	'day-with-suffix format should return "24th" for the twenty-fourth day of the month': function() {
		var actual = new Date(Date.UTC(2008,5,24)).formatUTCString("DDth");
		var expected = "24th";
		value_of(actual).should_be(expected);
	},
	'day-with-suffix format should return "1st" for the January 32 [sic]': function() {
		var actual = new Date(Date.UTC(2008,0,32)).formatUTCString("DDth");
		var expected = "1st";
		value_of(actual).should_be(expected);
	}


});

// ]]>
