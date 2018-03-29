import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/tap:i18n';
import { TagCategories } from 'meteor/igoandsee:tag-categories-collection';
import { Locations } from 'meteor/igoandsee:locations-collection';

import moment from 'moment';

import './historyCards/historyUpdate/historyUpdate.js';
import './historyCards/historyComment/historyComment.js';
import './tagDetail.html';

Template.tagDetail.onCreated(function(){
  this.showNewTextMessage = new ReactiveVar( false );
});

Template.tagDetail.rendered = function(){

  $('#loadingTag').hide();
  $('.ui.checkbox').checkbox();
  $('.timepickers').datetimepicker({
     timepicker:false,
     closeOnDateSelect:true,
     onSelectDate:(ct,$i) => {
       let cardId = this.data._id;
       let date = new Date(ct);

       $('#loadingTag').show();
       Meteor.call('changeDueDate', cardId, date, function(err) {

         $('#loadingTag').hide();
         if (err) {
           let message = err.reason || TAPi18n.__('failed_change');
           Session.set('ERROR_MESSAGE', message);
           $('#modalError').modal('show');
         } else {
           Session.set('SUCCESS_MESSAGE', TAPi18n.__('date_changed'));
           $('#modalSuccess').modal('show');
         }

       });

     }
  });

};

Template.tagDetail.helpers({

  getCardClass(type) {
    return type==1?'red':'yellow';
  },

  showNewMessage() {
    return Template.instance().showNewTextMessage.get();
  },

  getImages() {
    let imagesArray = this.descriptions.filter( (doc) => doc.type == 2 );
    return imagesArray.map( (doc) =>  doc.url );
  },

  getAudios() {
    let audiosArray = this.descriptions.filter( (doc) => doc.type == 1 );
    return audiosArray.map( (doc) => { return {url : doc.url, name : doc.name} } );
  },

  getTextDescriptions() {
    let textsArray = this.descriptions.filter( (doc) => doc.type == 0 );
    return textsArray.map( (doc) => doc.data );
  },

  getActions() {
    return this.actions;
  },

  formatDate(date) {
    return moment(date).format('DD MMM YYYY');
  },

  getLocation(location) {
    return Locations.findOne(location).name;
  },

  getCategory(category) {
    return TagCategories.findOne(category).name;
  },

  showUpdates(updates) {
    return updates.length > 0;
  },

  isOpen() {
    return this.status == 1;
  },

  showEditDue() {
    if (this.owner == Meteor.userId()) {
      return this.status == 1;
    }
    return false;
  },

  ableToClose() {
    return Meteor.userId() === this.scale;
  }

});

Template.tagDetail.events({

  'click #addDescription'(e) {
    Template.instance().showNewTextMessage.set(true);
  },

  'click #publishTextDescription'(e, template) {

    let text = $('#newDescription').val();

    let cardId = template.data._id;
    let json = {
      type : 0,
      url  : '',
      data : text,
      name : 'Note'
    };

    Template.instance().showNewTextMessage.set(false);
    Meteor.call('addDescriptionToCard', json, cardId, function(err) {

      console.log('Callback: ', err);
      /*
      if (err) {
        alert('' + err);
      } else {

      }
      */

    });

  },

  'click #cancelTextDescription'(e) {
    Template.instance().showNewTextMessage.set(false);
  },

  'click #showEditDue'(e) {
    e.preventDefault();
    $('#editDueDate').focus();
  },

  'click #addPhoto'(e) {
    console.log('Add photo');
    $('#uploadPhoto').click();
  },

  'click #addAudio'(e) {
    console.log('Add audio');
    $('#uploadAudio').click();
  },

  'change #uploadPhoto'(e, template) {

    let upload = new Slingshot.Upload("imageUploads");

    $('#loadingTag').show();
    FS.Utility.eachFile(event, function(file) {

      upload.send(file, function (error, downloadUrl) {

        console.log('Callback Send');
        $('#loadingTag').hide();

        if (error) {
          console.error('Error uploading');
          console.log(error);
          alert('Error: ', error)

        } else {
          console.log("Success!");
          console.log('uploaded file available here: ', downloadUrl);

          let cardId = template.data._id;
          let json = {
            type : 2,
            url  : downloadUrl,
            data : downloadUrl,
            name : file.name
          };

          Meteor.call('addDescriptionToCard', json, cardId, function(err) {

            if (err) {
              alert('' + err);
            }

          });

        }

      });

    });

  },

  'change #uploadAudio'(e, template) {

    let upload = new Slingshot.Upload("imageUploads");

    $('#loadingTag').show();
    FS.Utility.eachFile(event, function(file) {

      upload.send(file, function (error, downloadUrl) {

        console.log('Callback Send');
        $('#loadingTag').hide();

        if (error) {
          console.error('Error uploading');
          console.log(error);
          alert('Error: ', error)

        } else {
          console.log("Success!");
          console.log('uploaded file available here: ', downloadUrl);

          let cardId = template.data._id;
          let json = {
            type : 3,
            url  : downloadUrl,
            data : downloadUrl,
            name : file.name
          };

          Meteor.call('addDescriptionToCard', json, cardId, function(err) {

            if (err) {
              alert('' + err);
            }

          });

        }

      });

    });

  },

  'click .deleteCard'(e) {
    e.preventDefault();
    let id = $(e.target).closest('a').data('id');

    console.log(id);

    Session.set('OPTIONS_MESSAGE', TAPi18n.__('delete_this_card'));

    $('modalOptions').modal({
      closable  : false,
      onDeny() {

      },
      onApprove() {

        let cardId  = template.data._id;

        Meteor.call('deleteCard', cardId, function(error, result){

          if(error){
              Session.set('ERROR_MESSAGE', TAPi18n.__('error_delete_card'));
              $('#modalError').modal('show');
          }else if(result){
              Session.set('SUCCESS_MESSAGE', TAPi18n.__('card_deleted'));
              $('#modalSuccess').modal('show');
          }
        });
      }
    }).modal('show');

  },

  'click #sendMessage'(e, template) {
    let message = $('#newMessage').val();

    if (message.trim() == '') {
      let messageError = 'Escribe un mensaje';
      Session.set('ERROR_MESSAGE', messageError);
      $('#modalError').modal('show');
      return;
    }

    let cardId  = template.data._id;

    Meteor.call('addMessageToCard', message, cardId, function(err) {

      $('#newMessage').val('');
      if (err) {
        let message = err.reason || TAPi18n.__('error_message');
        Session.set('ERROR_MESSAGE', message);
        $('#modalError').modal('show');
      }

    });

  },

  'click #btnCloseCard'(e, template) {

    Session.set('OPTIONS_MESSAGE', TAPi18n.__('close_card_message'));

    $('#modalOptions').modal({

      closable  : false,
      onDeny    : function(){

      },

      onApprove : function() {

        let cardId  = template.data._id;

        Meteor.call('closeCard', cardId, function(err) {

          if (err) {
            let message = err.reason || TAPi18n.__('error_close_card');
            Session.set('ERROR_MESSAGE', message);
            $('#modalError').modal('show');
          } else {
            Session.set('SUCCESS_MESSAGE', TAPi18n.__('sucess_close_card'));
            $('#modalSuccess').modal('show');
          }

        });

      }

    }).modal('show');

  }

});
