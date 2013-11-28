Projects = new Meteor.Collection('projects');
Tasks = new Meteor.Collection('tasks');

if (Meteor.isClient) {

	trackingSession = 0;
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
			Session.setDefault("delete-id", 0);
			Session.set('page', 'main');
		},

		project: function(pid) {
			Session.setDefault("delete-id", 0);
			Session.set("current_id", pid);
			Session.set('section', '');
			Session.set('page', 'project');
			bindProjectKeys();
		},

		task: function(pid, tid) {
			Session.setDefault("delete-id", 0);
			Session.set("current_id", pid);
			Session.set("task_id", tid);
			Session.set('section', 'task');
			Session.set('page', 'project');
			bindTaskKeys();
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

	Template.deletecontent.deleteModel = function() {
		var mod;
		if(Session.get("delete-type") === "task") {
			mod = Tasks.findOne({_id : Session.get("delete-id")});
		} else {
			mod = Projects.findOne({_id : Session.get("delete-id")});
		}
		return mod;
	}

	Template.deletecontent.events = {
		'click .btn-primary' : function() {
			if(Session.get("delete-type") === "task") {
				Tasks.remove({_id : this._id});
				$("#delete-modal").modal('hide');
			} else {
				var tasks = Tasks.find({project:this._id});
				var idList = [];

				tasks.forEach(function(t) {
					idList.push(t._id);
				});

				for (var i = idList.length - 1; i >= 0; i--) {
					
					Tasks.remove({_id : idList[i]});
				};

				Projects.remove({_id : this._id});

				$("#delete-modal").modal('hide');
			}
		}
	}
}