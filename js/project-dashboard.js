if (Meteor.isClient) {

	Template.dashboard.allUtils = function() {
		return Tasks.find({project : Session.get("current_id")}, {fields: {utils:1}}).fetch();
	}

	Template.stats.allTasks = function() {
		return  Tasks.find({project : Session.get("current_id")}).fetch();
	}

	Template.stats.totalEstimation = function() {
		var total = 0;
		this.forEach(function(t) {
			total += t.estimation;
		});

		return Math.round(total / 60);
	}

	Template.stats.totalSpent = function() {
		var total = 0;
		this.forEach(function(t) {
			total += t.time;
		});

		return Math.round(total / 60);
	}

	Template.stats.timeLeft = function() {
		var totalT = 0, totalE = 0;
		this.forEach(function(t) {
			totalT += t.time;
			totalE += t.estimation;
		});

		return Math.floor((1 - totalT / totalE) * 100);
	}

	Template.stats.colorValue = function() {
		var r = (100 - this.valueOf()) / 100 * 255;
		var g = (this.valueOf()) / 100 * 255;

		return r + "," + g + ", 0";
	}

	Template.stats.taskResolved = function() {
		var resolved = 0;
		this.forEach(function(t) {
			if(t.done) resolved += 1;
		});

		return Math.floor((resolved / this.length) * 100);
	}

	Template.stats.subtaskResolved = function() {
		var resolved = 0;
		var total = 0;
		this.forEach(function(t) {
			if(!t.subTasks) return;
			total += t.subTasks.length;
			for (var i = t.subTasks.length - 1; i >= 0; i--) {
				if(t.subTasks[i].done) resolved += 1;
			};
		});

		return Math.floor((resolved / total) * 100);
	}

}