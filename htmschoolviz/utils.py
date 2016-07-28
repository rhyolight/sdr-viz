import time
import json

import numpy as np
import redis

redisClient = redis.Redis("localhost")



def compress(sdr):
  out = {
    "length": len(sdr)
  }
  indicesOut = []
  for i, bit in enumerate(sdr):
    if bit == 1 or bit == 1.0: indicesOut.append(i)
  out["indices"] = indicesOut
  return out


def decompress(sdr):
  out = np.zeros(shape=(sdr["length"],))
  for i in sdr["indices"]:
    out[i] = 1.0
  return out


def saveStateToRedis(spWrapper):
  start = time.time()
  if spWrapper._lastInput is None:
    raise ValueError("Cannot save SP state because it has never seen input.")
  state = spWrapper.getCurrentState(
    getConnectedSynapses=True,
    getPermanences=True,
  )

  # Active columns and overlaps are small, and can be saved in one key for
  # each time step.
  for outType in [spWrapper.ACT_COL, spWrapper.OVERLAPS]:
    key = "{}_{}_{}".format(spWrapper._id, spWrapper._index, outType)
    payload = dict()
    payload[outType] = state[outType]
    redisClient.set(key, json.dumps(payload))

  # Connected synapses are big, and will be broken out and saved in one file
  # per column, so they can be retrieved more efficiently by column by the
  # client later.
  columnSynapses = state[spWrapper.CON_SYN]
  for columnIndex, connections in enumerate(columnSynapses):
    key = "{}_{}_col-{}_{}".format(spWrapper._id, spWrapper._index, columnIndex, CON_SYN)
    redisClient.set(key, json.dumps(columnSynapses[columnIndex]))

  # Permanences are also big, so same thing.
  perms = state[spWrapper.PERMS]
  for columnIndex, permanences in enumerate(perms):
    key = "{}_{}_col-{}_{}".format(spWrapper._id, spWrapper._index, columnIndex, PERMS)
    redisClient.set(key, json.dumps(perms[columnIndex]))

  end = time.time()
  print("\tSP state serialization took %g seconds" % (end - start))


def getSpColumnHistory(id, columnIndex, subject):
  searchString = "{}_*_col-{}_{}".format(id, columnIndex, subject)
  keys = redisClient.keys(searchString)
  columnsOut = []
  # Doing a range because the files need to be processed in the order the data
  # was processed, using the data cursor counting up from 0.
  for cursor in range(0, len(keys)):
    key = "{}_{}_col-{}_{}".format(
      id, cursor, columnIndex, subject
    )
    data = redisClient.get(key)
    if data is None:
      print "WARNING: Missing {} data for key: {}".format(subject, key)
      data = "[]"
    columnsOut.append(json.loads(data))
  return columnsOut
