import type { OutputTab } from './OutputPanel'
import type { WorkbenchDoc } from './workbenchDraft'
import { App, Splitter } from 'antd'
import { useState } from 'react'
import { CircuitEditor } from '../circuit/CircuitEditor'
import { useSerialLog } from '../serial/useSerialLog'
import { SIMULATED_BOARD_ID } from '../simulator/unoPins'
import { useAvrSimulation } from '../simulator/useAvrSimulation'
import { CodeEditor } from './CodeEditor'
import { OutputPanel } from './OutputPanel'
import { useBuild } from './useBuild'
import { useSaveShortcut } from './useSaveShortcut'
import { useWorkbenchState } from './useWorkbenchState'
import { WorkbenchToolbar } from './WorkbenchToolbar'
import './workbench.css'

interface WorkbenchProps {
  initial: WorkbenchDoc
  /** 有值表示正在编辑已保存的项目，否则为本地草稿 */
  projectId?: string
}

/**
 * 一站式工作台：左边写代码、右边画电路，底部看编译输出与串口。
 * 编译 → 仿真（Uno）→ 烧录到真实开发板，都在这一个页面完成。
 */
export function Workbench({ initial, projectId }: WorkbenchProps) {
  const { message } = App.useApp()
  const state = useWorkbenchState(initial, projectId)
  const { doc } = state
  const build = useBuild(doc.boardId, doc.code)
  const simLog = useSerialLog()
  const [outputTab, setOutputTab] = useState<OutputTab>('log')
  const [port, setPort] = useState<string>()
  const sim = useAvrSimulation({
    circuit: doc.circuit,
    onSerialData: simLog.appendRx,
    onError: error => void message.error(`仿真出错：${error.message}`),
  })

  useSaveShortcut(() => void state.save())

  const startSim = async () => {
    setOutputTab('log')
    const hex = await build.ensureHex()
    if (!hex)
      return
    simLog.clear()
    simLog.appendInfo('仿真开始：Arduino Uno（ATmega328P @ 16MHz）')
    sim.start(hex)
    setOutputTab('serial')
  }

  const stopSim = () => {
    sim.stop()
    simLog.appendInfo('仿真已停止')
  }

  const compile = () => {
    setOutputTab('log')
    void build.compile()
  }

  const upload = () => {
    if (!port)
      return
    setOutputTab('log')
    void build.upload(port)
  }

  return (
    <div className="workbench">
      <WorkbenchToolbar
        name={doc.name}
        onNameChange={state.setName}
        boardId={doc.boardId}
        onBoardChange={state.changeBoard}
        isProject={Boolean(projectId)}
        dirty={state.dirty}
        saving={state.saving}
        onSave={() => void state.save()}
        building={build.running}
        onCompile={compile}
        simSupported={doc.boardId === SIMULATED_BOARD_ID}
        simRunning={sim.running}
        simSeconds={sim.simSeconds}
        onSimStart={() => void startSim()}
        onSimStop={stopSim}
        muted={sim.muted}
        onMutedChange={sim.setMuted}
        port={port}
        onPortChange={setPort}
        onUpload={upload}
      />
      <Splitter orientation="vertical" className="workbench-body">
        <Splitter.Panel defaultSize="70%" min="30%">
          <Splitter>
            <Splitter.Panel defaultSize="42%" min={280}>
              <div className="workbench-code">
                <CodeEditor value={doc.code} onChange={state.setCode} />
              </div>
            </Splitter.Panel>
            <Splitter.Panel min={320}>
              <CircuitEditor
                key={state.circuitKey}
                defaultValue={doc.circuit}
                onChange={state.setCircuit}
                sim={sim.partStates}
                running={sim.running}
                onPressButton={sim.pressButton}
                paletteMode="popover"
                fileName={doc.name}
              />
            </Splitter.Panel>
          </Splitter>
        </Splitter.Panel>
        <Splitter.Panel min={140}>
          <OutputPanel
            activeTab={outputTab}
            onTabChange={setOutputTab}
            taskId={build.taskId}
            sizeSummary={build.sizeSummary}
            boardId={doc.boardId}
            simLog={simLog}
            simRunning={sim.running}
            onSimSend={sim.sendSerial}
          />
        </Splitter.Panel>
      </Splitter>
    </div>
  )
}
