import { StyleSheet } from "react-native";

const stylesListItem = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'rgba(196, 196, 196, 1)',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  removeButton: {
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  taskText: {
    color: '#000',
    fontSize: 16,
  },
});
export default stylesListItem;