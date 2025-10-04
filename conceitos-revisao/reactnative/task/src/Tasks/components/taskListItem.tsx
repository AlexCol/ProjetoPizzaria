import React from 'react'
import { Text, View } from 'react-native'
import Task from '../../model/Task'
import { useTasksType } from '../tasks.states'

type TaskListItemProps = {
  task: Task,
  states: useTasksType
}

export default function TaskListItem({ task, states }: TaskListItemProps) {
  return (
    <View>
      <Text>{task.description} - remover: {task.key}</Text>
    </View>
  )
}