import SignIn from ".";
import { StackScreenConfig } from "../../routes/StackScreenConfig";

const SignInConfigStack: StackScreenConfig = {
  name: "SignIn",
  component: SignIn,
  options: {
    // title: 'Tela SignIn',
    // headerStyle: {
    //   backgroundColor: '#808000', // cor do header
    // },
    // headerTintColor: '#fff', // cor da fonte do header
    // headerTitleStyle: {
    //   fontWeight: 'bold',
    // },
    headerShown: false, // desabilita o header    
  },
}
export default SignInConfigStack;
