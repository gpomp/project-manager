if (Meteor.isClient) {

	Template.task.utilsList = function() {
		return getCurrentTask().fetch()[0].utils || "";
	}

	Template.subtasks.subtasksList = function() {
		return getCurrentTask().fetch()[0].subTasks || "";
	}

	Template.subtasks.isDone = function() {
		var checkbox = '<input type="checkbox">';
		if(this.done) checkbox = '<input type="checkbox" checked>';
		return checkbox;
	}

	Template.subtasks.doneCross = function() {
		return (this.done) ? "done" : "";
	}

	Template.task.model = function() {
		return getCurrentTask().fetch()[0];
	}

	Template.task.isValid = function() {
		return (this.estimation === 0) ? 'error' : '';
	}

	Template.task.getTime = function() {
		return Math.round(this.time / 60 * 10) / 10;
	}

	Template.task.getEstimation = function() {		
		return Math.round(this.estimation / 60 * 10) / 10;
	}

	Template.task.isTrakingBadge = function() {
		return (Session.equals("isTracking", true)) ? "display:inline-block" : "display:none";
	}

	Template.task.getSince = function() {
		return Session.get("countCurrentTime");
	}

	getCurrentTask = function() {
		var pid = Session.get("task_id");
		var request = Tasks.find({_id : pid});
		return request;
	}


	bindTaskKeys = function() {
		bindProjectKeys();

		Mousetrap.unbind('ctrl+alt+u');
		Mousetrap.bind('ctrl+alt+u', function(e) {
			e.preventDefault();
			$(".add-utils-section").css("display", "block");
			$("#add-utils").focus();
		});

		Mousetrap.unbind('ctrl+alt+s');
		Mousetrap.bind('ctrl+alt+s', function(e) {
			e.preventDefault();
			$(".add-subtask-section").css("display", "block");
			$("#add-subtask").focus();
		});

		Mousetrap.unbind('ctrl+alt+enter');
		Mousetrap.bind('ctrl+alt+enter', function(e) {
			e.preventDefault();
			toggleTracking();
		});
	}

	updateEstimation = function(t) {
		var minTime = t * 60;
		Tasks.update(
			{_id : Session.get("task_id")},
			{$set: {estimation: minTime}}
		);
	}



	updateTimeSpent = function(t) {
		var minTime = t * 60;
		Tasks.update(
			{_id : Session.get("task_id")},
			{$set: {time: minTime}}
		);
	}

	toggleTracking = function() { 
		$(".add-task-section, .add-utils-section, .add-subtask-section").css("display", "none");
		if(Session.equals("isTracking", true)) {
			Session.set("isTracking", false);
		} else {
			Session.set("isTracking", true);
		}
		if(Session.equals("isTracking", true)) {
			$("input.track-time").attr("value", "stop tracking");
			clearInterval(trackingSession);
			Session.set("startTrackTime", new Date().getTime());
			Session.set("countCurrentTime", 0);
			Session.set("trackTime", new Date().getTime());
			trackingSession = setInterval(function() { trackTime(); }, 1000);
		} else {
			$("input.track-time").attr("value", "start tracking");
			clearInterval(trackingSession);
			updateTime();
		}
	}

	trackTime = function() {
		var diff = new Date().getTime() - Session.get("trackTime");
		if(diff / 1000 > 61) {
			updateTime();
		}
	}

	updateTime = function() {
		var diff = new Date().getTime() - Session.get("trackTime");
		
		Tasks.update(
				{_id : Session.get("task_id")},
				{$inc: {time: Math.round(diff / 1000 / 60)}}
			);
		Session.set("countCurrentTime", Math.round((new Date().getTime() - Session.get("startTrackTime")) / 1000 / 60));
		Session.set("trackTime", new Date().getTime());

	}

	Template.task.events = {

		'keydown #time-estimation' : function(e) {
			if(e.which === 13) {
				updateEstimation(document.getElementById("time-estimation").value);
			}
		},

		'keydown #time-spent' : function(e) {
			if(e.which === 13) {
				updateTimeSpent(document.getElementById("time-estimation").value);
			}
		},

		'click input.util-btn' : function() {
			var toAdd = urlify(document.getElementById("add-utils").value);
			Tasks.update(
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
				longdescr:urlify(longdescr)
			}
			Tasks.update(
				{_id : Session.get("task_id")},
				{$addToSet:{subTasks:subTask}},

				function(error) {
					document.getElementById("add-subtask").value = "";
					document.getElementById("subtask-descr").value = "";
				}
			);
		},

		'click input.track-time' : function(e) {
			toggleTracking();
		}

	}

	Template.subtasks.events = {
		'click a.delete-subtask' : function(e) {
			e.preventDefault();
			Tasks.update({_id : Session.get("task_id")}, {$pull: {subTasks:this}})
		},

		'change input[type=checkbox]' : function(e) {
			var obj = this;
			obj.done = e.currentTarget.checked;
			var taskId = $(e.currentTarget).parent().parent().index();

			var modifier = {$set: {}};
			modifier.$set["subTasks." + taskId + ".done"] = e.currentTarget.checked;
			Tasks.update({_id : Session.get("task_id")}, modifier);

		}
	}
}