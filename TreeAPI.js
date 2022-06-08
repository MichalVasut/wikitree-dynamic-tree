/*
 * TreeAPI.js
 * 
 * Provide a "Person" object where data is gathered from the WikiTree API.
 * We use the WikiTree API action "getPerson" to retrieve the profile data and then store it in object fields.
 * 
 */


// Put our functions into a "WikiTreeAPI" namespace.
window.WikiTreeAPI = window.WikiTreeAPI || {};

// Our basic constructor for a Person. We expect the "person" data from the API returned result
// (see getPerson below). The basic fields are just stored in the internal _data array.
// We pull out the Parent and Child elements as their own Person objects.
WikiTreeAPI.Person = function(data){
  this._data = data;

  if(data.Parents){
    for(var p in data.Parents){
      this._data.Parents[p] = new WikiTreeAPI.Person(data.Parents[p]);
    }
  }
  if(data.Children){
    for(var c in data.Children){
      this._data.Children[c] = new WikiTreeAPI.Person(data.Children[c]);
    }
  }
};

// Basic "getters" for the data elements.
WikiTreeAPI.Person.prototype.getId = function() { return this._data.Id; }
WikiTreeAPI.Person.prototype.getName = function() { return this._data.Name; }
WikiTreeAPI.Person.prototype.getGender = function() { return this._data.Gender; }
WikiTreeAPI.Person.prototype.getBirthDate = function() { return this._data.BirthDate; }
WikiTreeAPI.Person.prototype.getBirthLocation = function() { return this._data.BirthLocation; }
WikiTreeAPI.Person.prototype.getDeathDate = function() { return this._data.DeathDate; }
WikiTreeAPI.Person.prototype.getDeathLocation = function() { return this._data.DeathLocation; }
WikiTreeAPI.Person.prototype.getChildren = function() { return this._data.Children; }
WikiTreeAPI.Person.prototype.getFatherId = function() { return this._data.Father; }
WikiTreeAPI.Person.prototype.getMotherId = function() { return this._data.Mother; }
WikiTreeAPI.Person.prototype.getDisplayName = function() { return this._data.BirthName ? this._data.BirthName : this._data.BirthNamePrivate; }
WikiTreeAPI.Person.prototype.getPhotoUrl = function() {
  if (this._data.PhotoData && this._data.PhotoData['url']) { 
    return this._data.PhotoData['url'];
  }
}
// Getters for Mother and Father return the Person objects, if there is one.
// The getMotherId and getFatherId functions above return the actual .Mother and .Father data elements (ids).
WikiTreeAPI.Person.prototype.getMother = function() {
  if (this._data.Mother && this._data.Parents) {
    return this._data.Parents[this._data.Mother];
  }
};
WikiTreeAPI.Person.prototype.getFather = function() {
  if (this._data.Father && this._data.Parents) {
    return this._data.Parents[this._data.Father];
  }
};

// We use a few "setters". For the parents, we want to update the Parents Person objects as well as the ids themselves.
// For TreeViewer we only set the parents and children, so we don't need setters for all the _data elements.
WikiTreeAPI.Person.prototype.setMother = function(person) {
  var id = person.getId();
  var oldId = this._data.Mother;
  this._data.Mother = id;
  if (!this._data.Parents) { this._data.Parents = {}; }
  else if (oldId) { delete this._data.Parents[oldId]; }
  this._data.Parents[id] = person;
};
WikiTreeAPI.Person.prototype.setFather = function(person) {
  var id = person.getId();
  var oldId = this._data.Father;
  this._data.Father = id;
  if (!this._data.Parents) { this._data.Parents = {}; }
  else if (oldId) { delete this._data.Parents[oldId]; }
  this._data.Parents[id] = person;
};
WikiTreeAPI.Person.prototype.setChildren = function(children) { this._data.Children = children; }



// To get a Person for a given id, we POST to the API's getPerson action. When we get a result back,
// we convert the returned JSON data into a Person object.
// Note that postToAPI returns the Promise from jquery's .ajax() call.
// That feeds our .then() here, which also returns a Promise, which gets resolved by the return inside the "then" function.
// So we can use this through our asynchronous actions with something like:
// WikiTree.getPerson.then(function(result) {
//    // the "result" here is that from our API call. The profile data is in result[0].person.
// });
//
WikiTreeAPI.getPerson = function(id,fields) {
  return WikiTreeAPI.postToAPI( { 'action': 'getPerson', 'key': id, 'fields': fields.join(','), 'resolveRedirect': 1 } )
    .then(function(result) {
      return new WikiTreeAPI.Person(result[0].person);
    });
}

// This is just a wrapper for the Ajax call, sending along necessary options for the WikiTree API.
WikiTreeAPI.postToAPI = function(postData) {
  var API_URL = 'https://api.wikitree.com/api.php';

	var ajax = $.ajax({
		// The WikiTree API endpoint
		'url': API_URL,
	
		// We tell the browser to send any cookie credentials we might have (in case we authenticated).
		'xhrFields': { withCredentials: true },

		// We're POSTing the data so we don't worry about URL size limits and want JSON back.
		type: 'POST',
		dataType: 'json',
    data: postData
	});

	return ajax;
}
