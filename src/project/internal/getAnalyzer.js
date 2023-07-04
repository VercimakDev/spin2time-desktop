/**
 * @Param Index of the value you want to retrieve. Starting at 0 [projectID, userID]
 * @Return Value which is corresponding to the index
 */
exports.getParams = function(index) {
    var getArgs = window.location.search.substr(1);
    var params = getArgs.split("&");
    return params[index].split("=")[1];
}