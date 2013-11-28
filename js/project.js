
if (Meteor.isClient) {

	//Routing
	Template.project.currentSection = function (section) {
		return Session.equals("section", section);
	};

	Template.project.model = function() {
		return getCurrentProject().fetch()[0];
	}

	Template.tasks.taskList = function() {
		
		return Tasks.find({project : Session.get("current_id")});
	}

	Template.tasks.isSelected = function() {
		return Session.equals("task_id", this._id) ? 'selected' : '';
	}

	getCurrentProject = function() {
		var pid = Session.get("current_id");
		var request = Projects.find({_id : pid});
		return request;
	}

	bindProjectKeys = function() {

		Mousetrap.unbind('ctrl+alt+t');
		Mousetrap.bind('ctrl+alt+t', function(e) {
			e.preventDefault();
			$(".add-task-section").css("display", "block");
			$("#task-name").focus();
		});
	}

	insertTask = function() {
		var taskName = document.getElementById("task-name").value;
		Tasks.insert({
			name:taskName,
			project:Session.get("current_id"),
			time:0,
			estimation:0,
			done:false
		}, function(error, _id) {
			app.navigate("/project/" + Session.get("current_id") + "/" + _id, {trigger: true});
		});
	}

	Template.project.events = {

		"click a.delete" : function(e) {
			console.log("delete");
			Session.set("delete-type", "poject");
			Session.set("delete-id", this._id);
			$("#delete-modal").modal('show');
		}
	}

	Template.tasks.events = {
		'click input.add-task' : function() {
			insertTask();
		},

		'keydown #task-name' : function(e) {
			if(e.which === 13) {
				insertTask();
			}
		},

		'click .delete' : function(e) {
			Session.set("delete-type", "task");
			Session.set("delete-id", this._id);
			$("#delete-modal").modal('show');
		}
	}
}