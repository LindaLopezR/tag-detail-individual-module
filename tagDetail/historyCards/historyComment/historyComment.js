import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/tap:i18n';

import moment from 'moment';

import './historyComment.html';

Template.historyComment.helpers({

	formatDate(date) {
		date = date || 0;
		return moment(date).format('DD MMM YYYY HH:mm');
	}

});
