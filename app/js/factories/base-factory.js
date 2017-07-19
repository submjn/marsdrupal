app
  .factory('BaseFactory', function($http) {
      return {

          /*******************************************************
           * GET request
           ******************************************************/
          getRequest : function(requestUrl, successCallback, errorCallback, headers, hideLoading) {
              return this.request("GET", requestUrl, null, successCallback, errorCallback, headers, hideLoading);
          },

          /*******************************************************
           * POST request
           ******************************************************/
          postRequest: function(requestUrl, requestData, successCallback,  errorCallback, headers, hideLoading) {
              return this.request("POST", requestUrl, requestData, successCallback, errorCallback, headers, hideLoading);
          },

          /*******************************************************
           * http request
           ******************************************************/
          request : function(method, url, data, successCallback,
                  errorCallback, headers, hideLoading) {
              return $http({
                  method : method,
                  url : url,
                  data : data,
                  headers : headers,
                  hideLoading: hideLoading
              })

              .success(
                  function(data, status, headers, config) {
                      if (status == 403) {
                          alert('session expired');
                      } else {
                          if (successCallback) {
                              successCallback(data, status, headers);
                          }
                      }
                  })
              .error(
                  function(data, status, headers, config) {
                      if (errorCallback) {
                          errorCallback(data, status, headers);
                      }
                  });
          },

          baseRequestUrl : function(){
              return  'api/';
          }

      };
  });
