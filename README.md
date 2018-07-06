# snapshot-lambdas
Lambdas to create and delete EBS snapshots.

## instructions
Copy the `index.js` in each of the directories into their respective lambdas.  The region is hard-coded in as `us-west-2` but feel free to change that to the region you want. Or change it to an env variable.


## create-snapshots
Creates snapshots of a volume.

Required environment variables:
* SNAPSHOT_TAG -- what you'll be using to filter the snapshots for deletion
* VOLUME_ID -- what volume you want the snapshots to be of

## delete-snapshots
Deletes snapshots older than a certain number of days.

Required environment variables:
* SNAPSHOT_TAG -- which snapshots to fetch to delete
* DAYS_TO_KEEP -- how many days to keep snapshots around for before deleting


## credits
Based on this: https://github.com/rmzi/ebs_snapshots