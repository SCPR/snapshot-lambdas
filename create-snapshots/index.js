// Expects these env vars: DAYS_TO_KEEP, SNAPSHOT_TAG

var AWS = require('aws-sdk');
var _ = require('lodash');

AWS.config.region = process.env.REGION;

// Instantiate ec2 w/ specific API version
var ec2 = new AWS.EC2({apiVersion: '2015-10-01'});

var tagSnapshot = function(snapshotId) {
  var params = {
    Resources: [
      snapshotId
    ],
    Tags: [
      {
        Key: "Tag",
        Value: process.env.SNAPSHOT_TAG
      }
    ],
    DryRun: false
  };

  ec2.createTags(params, function(err, data) {
    if (err)
      console.log(err, err.stack);
    else
      console.log(`Successfully tagged snapshot ${snapshotId} with ${process.env.SNAPSHOT_TAG}`);
  });
};

var makeSnapshot = function(volumeId) {
  var params = {
    VolumeId: volumeId,
    Description: `Backup of ${volumeId} made at ` + new Date().toISOString().replace(/T/, ' ').replace(/\\..+/, ''),
    DryRun: false
  };

  ec2.createSnapshot(params, function(err, data) {
    if (err)
      console.log(err, err.stack);
    else
      console.log(`Successfully created snapshot of ${volumeId} tagged: ${process.env.SNAPSHOT_TAG}`);
      tagSnapshot(data.SnapshotId);
  });
};

exports.handler = (event, context, callback) => {
  var params = {
    DryRun: false,
    VolumeIds: [
      process.env.VOLUME_ID
    ]
  };
  ec2.describeVolumes(params, function(err, data) {
    if (err)
      console.log(err, err.stack);
    else {
      var volumeIds = _.map(data.Volumes, 'VolumeId');
      _.map(volumeIds, makeSnapshot);
    }
  });
};
