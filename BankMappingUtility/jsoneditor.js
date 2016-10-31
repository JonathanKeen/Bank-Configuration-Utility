
var json =
    {
  "_id": "c3df2061d6cd6f6d41f9b4c8e0035bbc",
  "$doctype": "CardManagementWebServiceFieldTemplateMapping",
  "ProcessorId": "1",
  "GlobalBankId": 50000,
  "CompanyKey": "",
  "MappingDefinitions": {
    "AccountStatusCode": [
        {
			"ExternalWebServiceId": " " ,
			"InternalDatabaseId": "1"
        },
        {
			"ExternalWebServiceId": "V9" ,
		    "InternalDatabaseId": "-1"
        },
        {
			"ExternalWebServiceId": "FA" ,
		    "InternalDatabaseId": "-1"
        },
		{
			"ExternalWebServiceId": "F1" ,
			"InternalDatabaseId": "-3"
        }
      ],
    "AccountStatusReasonCode": [
		{
          "ExternalWebServiceId": "0" ,
		      "InternalDatabaseId": "1"
        },
        {
          "ExternalWebServiceId": "1" ,
		      "InternalDatabaseId": "1"
        },
        {
          "ExternalWebServiceId": "2" ,
		      "InternalDatabaseId": "1"
        },
        {
          "ExternalWebServiceId": "3" ,
		      "InternalDatabaseId": "1"
        }
      ]
    }
};


function printJSON() {
    $('#json').val(JSON.stringify(json));
}

function postJSON() {

    var params = "&BankId=";
    params += $('#GlobalBankId').val();

    params  += "&webServiceMethodName=" 
    params += $('#WebServiceMethodName').val();

    var url = "https://visa-local.fraedom-dev.com:60403//cardmanagement/V1/webserviceFieldTemplate/GetBankMasterConfigurationForEdit?"
    url += params;

    xmlhttp = new XMLHttpRequest();

    xmlhttp.open("GET", url, true);
    xmlhttp.setRequestHeader("Content-type", "application/json");
    //xmlhttp.setRequestHeader("X-Parse-Application-Id", "xxx");
    //xmlhttp.setRequestHeader("X-Parse-REST-API-Key","xxx");
    xmlhttp.onreadystatechange = function () { //Call a function when the state changes.
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                json = JSON.parse(xmlhttp.responseText);
                json = JSON.parse(json); 
                $('#editor').jsonEditor(json, { change: updateJSON, propertyclick: showPath });
                printJSON();
        }
    }
  var parameters = "&BankId=100&webServiceMethodName=UpdateCard"

  // Neither was accepted when I set with parameters="username=myname"+"&password=mypass" as the server may not accept that
  xmlhttp.send();
}

function updateJSON(data) {
    json = data;
    printJSON();
}

function displayJSON(data) {
    alert(JSON.stringify(json));
}

function showPath(path) {
    $('#path').text(path);
}

$(document).ready(function() {

    $('#rest > button').click(function() {
        var url = $('#rest-url').val();
        $.ajax({
            url: url,
            dataType: 'jsonp',
            jsonp: $('#rest-callback').val(),
            success: function(data) {
                json = data;
                $('#editor').jsonEditor(json, { change: updateJSON, propertyclick: showPath });
                printJSON();
            },
            error: function() {
                alert('Something went wrong, double-check the URL and callback parameter.');
            }
        });
    });

    $('#json').change(function() {
        var val = $('#json').val();

        if (val) {
            try { json = JSON.parse(val); }
            catch (e) { alert('Error in parsing json. ' + e); }
        } else {
            json = {};
        }
        
        $('#editor').jsonEditor(json, { change: updateJSON, propertyclick: showPath });
    });

    $('#expander').click(function() {
        var editor = $('#editor');
        editor.toggleClass('expanded');
        $(this).text(editor.hasClass('expanded') ? 'Collapse' : 'Expand all');
    });
    
    printJSON();
    $('#editor').jsonEditor(json, { change: updateJSON, propertyclick: showPath });
});


