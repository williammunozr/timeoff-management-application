
'use strict';

var moment = require('moment');

function CalendarMonth(day, args){
    var me = this;
    this.date = moment(day).startOf('month');

    if (args && args.bank_holidays){
        var map = {};
        args.bank_holidays.forEach(function(day){
            day = moment(day);
            map[day.format(me.default_date_format())] = 1;
        });
        this._bank_holidays = map;
    } 
};

// TODO cover this with test
CalendarMonth.prototype.is_bank_holiday = function(day) {
    return this._bank_holidays && this._bank_holidays[
        this.get_base_date().date(day).format(this.default_date_format())
    ];
};

CalendarMonth.prototype.default_date_format = function(){
    return 'YYYY-MM-DD';
};

CalendarMonth.prototype.how_many_days = function() {
    return this.date.daysInMonth();
};

CalendarMonth.prototype.get_base_date = function(){
    return this.date.clone();
};

CalendarMonth.prototype._week_day_map = function(){
    return { 0:7, 1:1, 2:2, 3:3, 4:4, 5:5, 6:6 };
};

CalendarMonth.prototype.week_day = function(){
    return this._week_day_map()[ this.date.day() ];
};

CalendarMonth.prototype.how_many_blanks_at_the_start = function(){
    return this.week_day() - 1;
};

CalendarMonth.prototype.how_many_blanks_at_the_end = function(){
    return 7 - this._week_day_map()[ this.get_base_date().endOf('month').day() ];
};

CalendarMonth.prototype.is_weekend = function(day){
    var index = this._week_day_map()[ this.get_base_date().date(day).day() ];

    return index === 6 || index === 7;
};

CalendarMonth.prototype.as_for_template = function(){
    var weeks = [];
    var week = [];

    for( var i=0; i<this.how_many_blanks_at_the_start(); i++){
        week.push({val:''});
    }

    for( var i=1; i<=this.how_many_days(); i++){
        var day = {val:i};

        if ( this.is_weekend(i) ) {
            day.is_weekend = true;
        }

        if ( this.is_bank_holiday(i)){
            day.is_bank_holiday = true;
        }

        week.push(day);
        if (week.length >= 7) {
            weeks.push( week );
            week = [];
        }
    }

    for( var i=0; i<this.how_many_blanks_at_the_end(); i++){
        week.push({val:''});
    }

    weeks.push(week);
 
    return {
        month : this.get_base_date().format('MMMM'),
        weeks : weeks,
    };
};

module.exports = CalendarMonth; 