import Main from ".";
import { StackScreenConfig } from "../../routes/StackScreenConfig";

const MainConfigStack: StackScreenConfig = {
  name: "Main",
  component: Main,
  options: {
    title: 'Tela Main',
    headerStyle: {
      backgroundColor: '#808000', // cor do header
    },
    headerTintColor: '#fff', // cor da fonte do header
    headerTitleStyle: {
      fontWeight: 'bold',
    },
    //headerShown: false, // desabilita o header    
  },
}
export default MainConfigStack;
