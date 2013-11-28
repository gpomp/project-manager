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

	Template.task.isValid = function() {
		return (this.estimation === 0) ? 'error' : '';
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

	toggleTracking = function() {
		$(".add-task-section, .add-utils-section, .add-subtask-section").css("display", "none");
		$("input.track-time").toggleClass("tracking");

		if($("input.track-time").hasClass("tracking")) {
			$("input.track-time").attr("value", "stop tracking");
			clearInterval(trackingSession);
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

		Session.set("trackTime", new Date().getTime());

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
		},

		'click track-time' : function() {
			toggleTracking();
		}

	}

	Template.subtasks.events = {
		'click a.delete-subtask' : function(e) {
			var id = $(e.currentTarget).parent().index();
			//Tasks.update({_id : this._id}, {$pull: {subTasks:}})
		}
	}
}