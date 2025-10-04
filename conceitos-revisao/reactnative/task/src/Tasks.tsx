import FontAwesome from '@react-native-vector-icons/fontawesome6';
import React, { RefObject, useRef, useState } from 'react';
import { Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const Tasks = () => {
  const taskRef = useRef<string>(""); //para ter a variavel em memoria sem re-renderizar
  const taskInputRef = useRef<TextInput>(null) as RefObject<TextInput>; //para ter acesso ao componente em si
  const [taskList, setTaskList] = useState<string[]>([]);

  function buttonAdd() {
    setTaskList((prev) => [...prev, taskRef.current]); // ✅ cria novo array
    clearRefs();
  }

  function clearRefs() {
    taskRef.current = "";
    taskInputRef.current.clear();
    Keyboard.dismiss(); // Fecha o teclado
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tarefas</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder='Type your task...'
          onChangeText={(text) => taskRef.current = text}
          ref={taskInputRef}
        />
        <TouchableOpacity style={styles.buttonAdd} onPress={buttonAdd}>
          <FontAwesome name='plus' iconStyle='solid' size={20} color={"#fff"} />
        </TouchableOpacity>
      </View>

      <View>
        {taskList.map((item, index) => (
          <Text key={index}>
            {item} -- remover: {index}
          </Text>
        ))}
      </View>
    </View>
  )
}

export default Tasks;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 24,
    color: '#FFF',
    marginTop: '5%',
    paddingStart: '5%',
    marginBottom: 12
  },
  inputContainer: {
    flexDirection: 'row',
    width: '100%',
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  input: {
    width: '75%',
    backgroundColor: '#fff',
    height: 44,
    borderRadius: 4,
    paddingHorizontal: 8,
  },
  buttonAdd: {
    width: '15%',
    height: 44,
    backgroundColor: '#44b8be',
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
    textDecorationStyle: 'solid',
    borderRadius: 4,
  },
});