/**
 * Datepicker, currently used in commodity form (section 3) and home filter form (section 1).
 * Properties: 
 *  maxDate: expression return moment object
 *  ngDisabled: expression return boolean
 *  dateObject: expression return boolean, identify whether this control is used with ngModel is javascript date OR string with correct format
 *  hideButtonBar: expression return boolean, identify whether hide button bar (Clear and Done buttons)
 */
(function ($) {
    app.directive('customDatepicker',function($parse, COLLECTION_FREQUENCY, DATE_FORMAT){
        return {
            templateUrl: 'templateCache/custom-datepicker.tmpl.html',
            scope: {
                dateModel: '='
            },
            link: function(scope, elem, attrs){
                var minDate = moment().subtract(30, 'years').toDate();
                var maxDate = (attrs.maxDate && attrs.maxDate != '') ? $parse(attrs.maxDate)(scope) : null;
                var collectFrequency = (attrs.collectFrequency && attrs.collectFrequency != '') ? $parse(attrs.collectFrequency)(scope) : null;
                var isModelDateObj = attrs.dateObject && attrs.dateObject == 'true';

                scope.hideButtonBar = attrs.hideButtonBar && attrs.hideButtonBar == 'true';

                scope.tabindex = attrs.tab ? attrs.tab : 0;

                scope.$watch(function(){
                    return scope[attrs.maxDate]
                }, function(maxDate){
                    init(maxDate)
                });

                function init(maxDate){
                    var options = {
                        format: 'MM/dd/yyyy',
                        yearFormat: 'yy',
                        startingDay: 1,
                        minDate: minDate,
                        maxDate: maxDate,
                        appendToBody: true
                    };

                    if(collectFrequency == COLLECTION_FREQUENCY.WEEKLY) {
                        options.dateDisabled = function(dateMode) {
                            return dateMode.mode === 'day' && dateMode.date.getDay() != 1;
                        };

                    } else if(collectFrequency == COLLECTION_FREQUENCY.MONTHLY) {
                        options = {
                            format: 'MMMM yyyy',
                            formatMonth: 'MMMM',
                            formatYear: 'yyyy',
                            minMode: 'month',
                            minDate: minDate,
                            maxDate: maxDate,
                            appendToBody: true
                        };

                    } else if(collectFrequency == COLLECTION_FREQUENCY.YEARLY) {
                        options = {
                            format: 'yyyy',
                            formatYear: 'yyyy',
                            minMode: 'year',
                            minDate: minDate,
                            maxDate: maxDate,
                            appendToBody: true
                        };
                    }

                    scope.dateOptions = options;
                    scope.format = scope.dateOptions.format;
                }

                scope.$watch(function(){
                    return scope.dateModel;

                }, function(value){
                    if(!value) {
                        scope.dt = null;
                    } else {
                        if (isModelDateObj){
                            scope.dt = value;
                        } else {
                            var tmpDate = moment(value, DATE_FORMAT);
                            if(tmpDate.isValid()) {
                                scope.dt = tmpDate.toDate();
                            } else {
                                scope.dt = null;
                            }
                        }
                    }

                })

                scope.$watch(function(){
                    return $parse(attrs.ngDisabled)(scope);
                }, function(isDisabled){
                    scope.isDisabled = isDisabled;
                })

                var model = scope.dateModel;
                var dateObj = null;
                if(model && model != '') {
                    if (!isModelDateObj){
                        dateObj = moment(model, DATE_FORMAT).toDate();
                    } else {
                        dateObj = model;
                    }
                }

                if(dateObj != null) {
                    if (isModelDateObj){
                        scope.dateModel = dateObj;
                    } else {
                        scope.dateModel = model;
                    }
                    scope.dt = dateObj;
                } else {
                    scope.dt = null;
                }

                scope.$watch(function(){
                    return scope.dt;
                }, function(newDate){
                    newDate = newDate || null;
                    var newDateStr = newDate ? moment(newDate).format(DATE_FORMAT) : null;
                    if (isModelDateObj){
                        scope.dateModel = newDate;
                    } else {
                        scope.dateModel = newDateStr;
                    }
                })

                scope.status = {
                    opened: false
                };

                scope.open = function($event) {
                    scope.status.opened = true;
                };
            }
        }
    });
})(jQuery);