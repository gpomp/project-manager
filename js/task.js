if (Meteor.isClient) {

	Template.task.utilsList = function() {
		return getCurrentTask().fetch()[0].utils || "";
	}

	Template.subtasks.subtasksList = function() {
		return getCurrentTask().fetch()[0].subTasks || "";
	}

	Template.task.model = function() {
		return getCurrentTask().fetch()[0];
	}

	getCurrentTask = function() {
		var pid = Session.get("task_id");
		var request = Tasks.find({_id : pid});
		return request;
	}

	Template.task.events = {
		'click input.util-btn' : function() {
			var toAdd = document.getElementById("add-utils").value;
			Tasks.upsert(
				{_id : Session.get("task_id")},
				{$addToSet:{utils:toAdd}}
			);
		},

		'click input.subtask-btn' : function() {
			var taskName = document.getElementById("add-subtask").value;
			var longdescr = document.getElementById("subtask-descr").value;
			var subTask = {
				name:taskName,
				done:false,
				longdescr:longdescr
			}
			Tasks.upsert(
				{_id : Session.get("task_id")},
				{$addToSet:{subTasks:subTask}}
			);
		}

	}
}