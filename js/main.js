
if(Meteor.isServer) {
	Meteor.publish("getProjects", function() {
		return Projects.find({owner:this.userId});
	});

	Meteor.publish("getTasks", function(cId) {
		return Tasks.find({project : cId, owner:this.userId});
	});

	Meteor.publish("getCurrentTask", function(tId) {
		return Tasks.find({_id : tId, owner:this.userId});
	});
}




Projects = new Meteor.Collection('projects');
Tasks = new Meteor.Collection('tasks');

Projects.allow({
	insert: function(userId, project) {
		return userId && project.owner === userId;
	},

	update: function(userId, project) {
		return userId && project.owner === userId;
	},

	remove: function(userId, project) {
		return userId && project.owner === userId;
	}
});

Tasks.allow({
	insert: function(userId, task) {
		return userId && task.owner === userId;
	},

	update: function(userId, task) {
		return userId && task.owner === userId;
	},

	remove: function(userId, task) {
		return userId && task.owner === userId;
	}
});

if (Meteor.isClient) {
	Deps.autorun(function() {
		Meteor.subscribe("getProjects");
		Meteor.subscribe("getTasks", Session.get("current_id"));
		Meteor.subscribe("getCurrentTask", Session.get("task_id"));
	});

	trackingSession = 0;

	urlify = function(text) {
	    var urlRegex = /(https?:\/\/[^\s]+)/g;
	    return text.replace(urlRegex, function(url) {
	        return '<a target="_blank" href="' + url + '">' + url + '</a>';
	    })
	}

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
		Session.setDefault("isTracking", false);
		Backbone.history.start({pushState: true, root : "/"});
	});


	// Home	
	Template.projects.projectList = function() {
		return Projects.find({}, {sort: { name : 1 }});
	};

	insertProject = function() {
		var prName = document.getElementById("pr-name").value;
		if(prName.length !== 0 && Meteor.userId() !== null) {
			Projects.insert({
				name:prName,
				owner:Meteor.userId()
			}, function(error, _id) {
				console.log(error);
				app.navigate("project/" + _id, {trigger: true});
			});
		}
	}

	Template.projects.events = {
		'click button.add' : function() {
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

	Template.deletecontent.deleteType = function() {
		return Session.get("delete-type");
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