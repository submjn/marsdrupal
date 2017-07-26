app.factory('DataFactory', function DataFactory(CommonFactory, BaseFactory, $http, $q) {
    var exports = {};

    var baseUrl = "/services/v1/";

    var excludeColumns = [
        "Office Name",
        "Office Code",
        "Office City",
        "Office State",
        "Market Location Name",
        "Market Location City",
        "Market Location State",
        "Market Type",
        "Market Type Category"
    ];

    var groupColumns = ["Group", "Category", "Commodity"];

    exports.getCommoditiesPromise = function(){
        var defered = $q.defer();
        var requestUrl = baseUrl + "commodities";
        if (exports[requestUrl]){
            exports.commodities = angular.copy(exports[commodities]);

            defered.resolve([exports.commodities]);
        } else {
            BaseFactory.getRequest(requestUrl, function(data, status, headers, config){
                exports.commodities = data;
                exports[requestUrl] = angular.copy(data);

                defered.resolve([data, status, headers, config]);

            }, function(data, status, headers, config){
                defered.reject([data, status, headers, config]);
            })
        }
        return defered.promise;
    }

    exports.getOfficesPromise = function(){
        var defered = $q.defer();
        var requestUrl = baseUrl + "offices";
        if (exports[requestUrl]){
            exports.offices = angular.copy(exports[offices]);

            defered.resolve([exports.offices]);
        } else {
            BaseFactory.getRequest(requestUrl, function(data, status, headers, config){
                exports.offices = data;
                exports[requestUrl] = angular.copy(data);

                defered.resolve([data, status, headers, config]);

            }, function(data, status, headers, config){
                defered.reject([data, status, headers, config]);
            })
        }
        return defered.promise;
    }

    exports.getReportsPromise = function(){
        var defered = $q.defer();
        var requestUrl = baseUrl + "reports";
        if (exports[requestUrl]){
            exports.reports = angular.copy(exports[reports]);

            defered.resolve([exports.reports]);
        } else {
            BaseFactory.getRequest(requestUrl, function(data, status, headers, config){
                exports.reports = data;
                exports[requestUrl] = angular.copy(data);

                defered.resolve([data, status, headers, config]);

            }, function(data, status, headers, config){
                defered.reject([data, status, headers, config]);
            })
        }
        return defered.promise;
    }

    exports.getMarketLocationStatesPromise = function(){
        var defered = $q.defer();
        var requestUrl = baseUrl + "states";
        if (exports[requestUrl]){
            exports.marketLocationStates = angular.copy(exports[marketLocationStates]);

            defered.resolve([exports.marketLocationStates]);
        } else {
            BaseFactory.getRequest(requestUrl, function(data, status, headers, config){
                exports.marketLocationStates = data;
                exports[requestUrl] = angular.copy(data);

                defered.resolve([data, status, headers, config]);

            }, function(data, status, headers, config){
                defered.reject([data, status, headers, config]);
            })
        }
        return defered.promise;
    }

    exports.getMarketLocationsPromise = function(){
        var defered = $q.defer();
        var requestUrl = baseUrl + "markets";
        if (exports[requestUrl]){
            exports.marketLocations = angular.copy(exports[marketLocations]);

            defered.resolve([exports.marketLocations]);
        } else {
            BaseFactory.getRequest(requestUrl, function(data, status, headers, config){
                exports.marketLocations = data;
                exports[requestUrl] = angular.copy(data);

                defered.resolve([data, status, headers, config]);

            }, function(data, status, headers, config){
                defered.reject([data, status, headers, config]);
            })
        }
        return defered.promise;
    }

    /*********************************/
    /*****GET DATA API*********/
    /*********************************/

    function getDataPromise(entity, searchKey, queryParams) {
        var defered = $q.defer();

        var queryStr = "";
        if(queryParams) {
            for(var param in queryParams) {
                if(queryStr) {
                    queryStr += "&";
                }
                queryStr += param + "=" + queryParams[param];
            }
        }

        var requestUrl = baseUrl + entity + "/" + searchKey + "?" + queryStr;

        BaseFactory.getRequest(requestUrl, function(data, status, headers, config){
            var records = data.results;
            createTableColumns(records);
            assignIdToRecord(records);
            defered.resolve(records);

        }, function(data, status, headers, config){
            defered.reject([data, status, headers, config]);
        })
        return defered.promise;
    }

    function assignIdToRecord(records) {
        var ids = [];
        var id = CommonFactory.generateUUID();
        if(records && records.length) {
            _.forEach(records, function(record) {
                while(ids.indexOf(id) >= 0) {
                    id = CommonFactory.generateUUID();
                }
                record.id = id;
                ids.push(id);

                record.groupKey = record.group + " / " + record.category + " / " + record.commodity;
            })
        }
    }

    function createTableColumns(records) {
        var tableColumns = [{
                attrId: "column-controlled-child-rows",
                name: ''
            }];
        if(records && records.length) {
            for(var prop in records[0]) {
                var colName = formatTableName(prop);
                if(excludeColumns.indexOf(colName) < 0 && groupColumns.indexOf(colName) < 0) {
                    tableColumns.push({
                        attrId: prop,
                        name: colName
                    });
                }
            }
        }
        exports.tableColumns = tableColumns;
    }

    function formatTableName(colAttrId) {
        return colAttrId.replaceAll("_", " ")
                    //.replaceAll("Office ", "OF ").replaceAll("Market Location ", "ML ")
                    //.replaceAll("Market Type  ", "MT ")
                    .split(' ').map(_.capitalize).join(' ');
    }

    exports.getCommodityDataPromise = function(commodityName, queryParams){
        return getDataPromise("commodities", commodityName, queryParams);
    }

    exports.getOfficeDataPromise = function(officeName, queryParams){
        return getDataPromise("offices", officeName, queryParams);
    }

    exports.getReportDataPromise = function(reportName){
        return getDataPromise("reports", reportName, queryParams);
    }

    return exports;
});