import numpy as np

from utils import getSpColumnHistory


class SpWrapper:

  # storage keys
  CON_SYN = "connectedSynapses"
  PERMS = "permanences"
  POT_POOLS = "potentialPools"
  ACT_COL = "activeColumns"
  ACT_DC = "activeDutyCycles"
  OVP_DC = "overlapDutyCycles"
  OVERLAPS = "overlaps"


  def __init__(self, id, sp, save=True):
    self._id = id
    self._sp = sp
    self._potentialPools = None
    self._lastInput = None
    self._lastActiveColumns = None
    self._index = -1
    self._currentState = None
    self.save = save


  def compute(self, inputArray, learn):
    sp = self._sp
    columns = np.zeros(sp._numColumns, dtype="uint32")
    sp.compute(inputArray, learn, columns)
    self._lastInput = inputArray
    self._lastActiveColumns = columns
    self._index += 1


  def getCurrentState(self,
                      getPotentialPools=False,
                      getConnectedSynapses=False,
                      getPermanences=False,
                      getActiveDutyCycles=False,
                      getOverlapDutyCycles=False,
                     ):

    currentState = dict()

    try:
      activeColumns = self.getActiveColumns()
      currentState[ACT_COL] = activeColumns
    except RuntimeError:
      activeColumns = None

    currentState[OVERLAPS] = self.getOverlaps()

    if getPotentialPools:
      currentState[POT_POOLS] = self._calculatePotentialPools()

    if getConnectedSynapses:
      currentState[CON_SYN] = self._calculateConnectedSynapses()

    if getPermanences:
      currentState[PERMS] = self._calculatePermanences()

    if getActiveDutyCycles:
      currentState[ACT_DC] = self._calculateActiveDutyCycles()

    if getOverlapDutyCycles:
      currentState[OVP_DC] = self._calculateOverlapDutyCycles()

    self._currentState = currentState
    return currentState


  def getLastInput(self):
    return self._lastInput


  def getActiveColumns(self):
    if self._lastActiveColumns is None:
      raise RuntimeError("Cannot get active columns because SP has not run.")
    return self._lastActiveColumns


  def getOverlaps(self):
    return self._sp.getOverlaps().tolist()


  def getConnectionHistoryForColumn(self, columnIndex):
    return self._getColumnHistory(columnIndex, self.CON_SYN)


  def getPermanenceHistoryForColumn(self, columnIndex):
    return self._getColumnHistory(columnIndex, self.PERMS)


  def _getColumnHistory(self, columnIndex, subject):
    return getSpColumnHistory(self._id, columnIndex, subject)


  def _calculatePotentialPools(self):
    if self._potentialPools is None:
      sp = self._sp
      self._potentialPools = []
      for colIndex in range(0, sp.getNumColumns()):
        potentialPools = []
        potentialPoolsIndices = []
        sp.getPotential(colIndex, potentialPools)
        for i, pool in enumerate(potentialPools):
          if np.asscalar(pool) == 1.0:
            potentialPoolsIndices.append(i)
        self._potentialPools.append(potentialPoolsIndices)
    return self._potentialPools


  def _calculateConnectedSynapses(self):
    if self._currentState is not None and CON_SYN in self._currentState:
      return self._currentState[CON_SYN]
    sp = self._sp
    columns = []
    for colIndex in range(0, sp.getNumColumns()):
      connectedSynapses = np.zeros(shape=(sp.getInputDimensions(),))
      sp.getConnectedSynapses(colIndex, connectedSynapses)
      permIndices = np.nonzero(connectedSynapses)
      columns.append(permIndices[0].tolist())
    return columns


  def _calculatePermanences(self):
    if self._currentState is not None and PERMS in self._currentState:
      return self._currentState[PERMS]
    sp = self._sp
    columns = []
    for colIndex in range(0, sp.getNumColumns()):
      perms = np.zeros(shape=(sp.getInputDimensions(),))
      permIndices = []
      sp.getPermanence(colIndex, perms)
      columns.append([round(perm, 2) for perm in perms.tolist()])
    return columns


  def _calculateActiveDutyCycles(self):
    sp = self._sp
    dutyCycles = np.zeros(shape=(sp.getNumColumns(),))
    sp.getActiveDutyCycles(dutyCycles)
    return dutyCycles.tolist()



  def _calculateOverlapDutyCycles(self):
    sp = self._sp
    dutyCycles = np.zeros(shape=(sp.getNumColumns(),))
    sp.getOverlapDutyCycles(dutyCycles)
    return dutyCycles.tolist()



  def getHistory(self, cursor):
    length = len(self._history)
    if cursor > length:
      raise KeyError(
        "SP History for {} is out of range for current history with length {}."\
        .format(cursor, length)
      )
    return self._history[cursor]


