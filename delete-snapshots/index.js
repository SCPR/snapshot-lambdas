// Expects these env vars: DAYS_TO_KEEP, SNAPSHOT_TAG

var AWS = require('aws-sdk');
var _ = require('lodash');

// Configure AWS region
AWS.config.region = 'us-west-2';

var daysToKeep = process.env.DAYS_TO_KEEP;

// Instantiate ec2 w/ specific API version
var ec2 = new AWS.EC2({apiVersion: '2015-10-01'});

var deleteSnapshot = function(snapshot_id) {
  var snapshot_params = {
    SnapshotId: snapshot_id,
    DryRun: false
  };

  ec2.deleteSnapshot(snapshot_params, function(err, data) {
    if (err)
      console.log(err, err.stack);
    else {
      console.log("Successfully deleted " + snapshot_id);
    }
  });
};

var params = {
  DryRun: false,
  Filters: [
    {
      Name: 'tag:Tag',
      Values: [process.env.SNAPSHOT_TAG]
    }
  ]
};

var getExpired = function(snapshot) {
  var snapshotStartTime = new Date(snapshot.StartTime).getTime();
  return new Date(snapshotStartTime + (1000 * 60 * 60 * 24 * daysToKeep)) < new Date()
};

exports.handler = (event, context, callback) => {
  ec2.describeSnapshots(params, function(err, data) {
    if (err)
      console.log(err, err.stack);
    else
      var expired_snapshots = _.filter(data.Snapshots, getExpired);
    var expired_snapshot_ids = _.map(expired_snapshots, 'SnapshotId');
    _.map(expired_snapshot_ids, deleteSnapshot)
  });
};
