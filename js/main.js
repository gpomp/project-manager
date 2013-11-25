Projects = new Meteor.Collection('projects');
Tasks = new Meteor.Collection('tasks');

if (Meteor.isClient) {
	//Routing
	Template.content.currentPage = function (page) {
		return Session.equals("page", page);
	};	

	var Router = Backbone.Router.extend({
		routes: {
			"project/:pid/:tid": "task",
			"project/:pid":     "project",   // http://your_domain/help
			"":                 "main" //this will be http://your_domain/
		},

		main: function() {
			Session.set('page', 'main');
		},

		project: function(pid) {
			Session.set("current_id", pid);
			Session.set('page', 'project');
		},

		task: function(pid, tid) {
			Session.set("current_id", pid);
			Session.set("task_id", tid);
			Session.set('section', 'task');
			Session.set('page', 'project');
		}
	});

	app = new Router;
	Meteor.startup(function () {
		Backbone.history.start({pushState: true, root : "/"});
	});


	// Home	
	Template.projects.projectList = function() {
		return Projects.find({}, {sort: { name : 1 }});
	};

	insertProject = function() {
		var prName = document.getElementById("pr-name").value;
		if(prName.length !== 0) {
			Projects.insert({
				name:prName
			}, function(error, _id) {
				app.navigate("project/" + _id, {trigger: true});
			});
		}
	}

	Template.projects.events = {
		'click input.add' : function() {
			insertProject();
		},

		'keydown #pr-name' : function(e) {
			if(e.which === 13) {
				insertProject();
			}
		},

		"change select.projects-list" : function(event) {
			app.navigate("project/" + event.srcElement.value, {trigger: true});
		}
	};
}