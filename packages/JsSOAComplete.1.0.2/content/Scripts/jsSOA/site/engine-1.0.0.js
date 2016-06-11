//Start the engine once the document is fully loaded
$(document).ready(function () {
    var sslRequired = false; //TODO: specify if SSL is required (can be conditional based on the host)
    var siteName = 'Sample Site Name'; //TODO: specified the name of the application or site

    jsSOA.engine.initialize([jsSOA.service, jsSOA.site.service], siteName, sslRequired); //TODO: specify your application name here 
});