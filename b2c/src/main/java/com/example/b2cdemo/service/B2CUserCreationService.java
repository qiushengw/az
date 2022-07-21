package com.example.b2cdemo.service;

import java.security.SecureRandom;
import java.util.Arrays;
import java.util.LinkedList;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import java.util.stream.Stream;

import com.azure.identity.ClientSecretCredential;
import com.azure.identity.ClientSecretCredentialBuilder;
import com.microsoft.graph.authentication.TokenCredentialAuthProvider;
import com.microsoft.graph.models.ObjectIdentity;
import com.microsoft.graph.models.PasswordProfile;
import com.microsoft.graph.models.User;
import com.microsoft.graph.requests.GraphServiceClient;

import com.nimbusds.jose.shaded.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class B2CUserCreationService {
    @Value("${azure.adb2c.application.id}")
    private String clientId;

    @Value("${azure.adb2c.client.secret}")
    private String clientSecret;

    @Value("${azure.adb2c.tenant.id}")
    private String tenantId;

    @Value("${azure.adb2c.tenant.name}")
    private String tenantName;

    @Value("${microsoft.graph.scope}")
    private String scope;

    @Value("${email.service.url}")
    private String emailServiceUrl;

    public com.microsoft.graph.models.User createUser(final String company, final String username) {
        final ClientSecretCredential clientSecretCredential = new ClientSecretCredentialBuilder()
            .clientId(clientId)
            .clientSecret(clientSecret) //required for web apps, do not set for native apps
            .tenantId(tenantId)
            .build();

        final TokenCredentialAuthProvider tokenCredentialAuthProvider = new TokenCredentialAuthProvider(Arrays.asList(scope), clientSecretCredential);

        GraphServiceClient graphClient = GraphServiceClient.builder()
                        .authenticationProvider(tokenCredentialAuthProvider)
                        .buildClient();

        User user = new User();
        user.accountEnabled = true;
        user.companyName=company;
        user.displayName = company + " " + username;
        user.mailNickname = company + "-" + username;
        user.userPrincipalName = company + username + "@" + tenantName + ".onmicrosoft.com";

        List<ObjectIdentity> identitiesList = new LinkedList<ObjectIdentity>();
        ObjectIdentity identity = new ObjectIdentity();
        identity.signInType="userName";
        identity.issuer = tenantName + ".onmicrosoft.com";
        identity.issuerAssignedId = company + username;
        identitiesList.add(identity);

        user.identities = identitiesList;

        user.passwordPolicies = "DisablePasswordExpiration";
        PasswordProfile passwordProfile = new PasswordProfile();
        passwordProfile.forceChangePasswordNextSignIn = true;
        passwordProfile.password = "P@ssw0rd01";
        user.passwordProfile = passwordProfile;

        com.microsoft.graph.models.User newUser = graphClient.users()
            .buildRequest()
            .post(user);

        return newUser;
    }


    public void createUser(final String companyName, final String firstName, final String lastName) {
        final ClientSecretCredential clientSecretCredential = new ClientSecretCredentialBuilder()
                .clientId(clientId)
                .clientSecret(clientSecret) //required for web apps, do not set for native apps
                .tenantId(tenantId)
                .build();

        final TokenCredentialAuthProvider tokenCredentialAuthProvider = new TokenCredentialAuthProvider(Arrays.asList(scope), clientSecretCredential);

        GraphServiceClient graphClient = GraphServiceClient.builder()
                .authenticationProvider(tokenCredentialAuthProvider)
                .buildClient();

        User user = new User();
        user.accountEnabled = true;
        user.companyName=companyName;
        user.displayName = firstName + " " + lastName;
        user.mailNickname = firstName + lastName;
        user.userPrincipalName = user.mailNickname + "@" + tenantName + ".onmicrosoft.com";
        user.passwordPolicies = "DisablePasswordExpiration";
        PasswordProfile passwordProfile = new PasswordProfile();
        passwordProfile.forceChangePasswordNextSignIn = false;
        passwordProfile.password = "P@ssw0rd01";
        user.passwordProfile = passwordProfile;

        graphClient.users()
                .buildRequest()
                .post(user);
    }


    public User createUserWithEmail(final String company, final String username, String email) {
        final ClientSecretCredential clientSecretCredential = new ClientSecretCredentialBuilder()
                .clientId(clientId)
                .clientSecret(clientSecret) //required for web apps, do not set for native apps
                .tenantId(tenantId)
                .build();

        final TokenCredentialAuthProvider tokenCredentialAuthProvider = new TokenCredentialAuthProvider(Arrays.asList(scope), clientSecretCredential);

        GraphServiceClient graphClient = GraphServiceClient.builder()
                .authenticationProvider(tokenCredentialAuthProvider)
                .buildClient();

        User user = new User();
        user.accountEnabled = true;
        user.companyName=company;
        user.mail=email;
        user.displayName = company + " " + username;
        user.mailNickname = company + "-" + username;
        user.userPrincipalName = company + username + "@" + tenantName + ".onmicrosoft.com";

        List<ObjectIdentity> identitiesList = new LinkedList<ObjectIdentity>();
        ObjectIdentity identity = new ObjectIdentity();
        identity.signInType="userName";
        identity.issuer = tenantName + ".onmicrosoft.com";
        identity.issuerAssignedId = company + username;
        identitiesList.add(identity);

        user.identities = identitiesList;

        user.passwordPolicies = "DisablePasswordExpiration";
        PasswordProfile passwordProfile = new PasswordProfile();
        passwordProfile.forceChangePasswordNextSignIn = true;
        String pass =  generateSecureRandomPassword();
        passwordProfile.password = pass;
        user.passwordProfile = passwordProfile;

        com.microsoft.graph.models.User newUser = graphClient.users()
                .buildRequest()
                .post(user);

       sendInvitation(newUser, email, pass);

        return newUser;
    }


    private void sendInvitation(User user, String email, String firstPassword){
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        JSONObject notification = new JSONObject();
        notification.put("from", "javaoasis@gmail.com");
        notification.put("to", email);
        notification.put("subject", "Welcome to join SCF");
        notification.put("text", "Dear Customer, you are invitated to join our SCF applicaiton ( https://localhost:9443/msal4jsample/secure/aad ), " +
                "\nYour first login password is "+ firstPassword);

        HttpEntity<String> request =
                new HttpEntity<String>(notification.toString(), headers);

        String personResultAsJsonStr =
                restTemplate.postForObject(emailServiceUrl, request, String.class);

        System.out.println(personResultAsJsonStr);
    }


    public String generateSecureRandomPassword() {
        Stream<Character> pwdStream = generatePassword(10);
        List<Character> passwordChar = pwdStream.collect(Collectors.toList());
        String password = passwordChar.stream()
                .collect(StringBuilder::new, StringBuilder::append, StringBuilder::append)
                .toString() + "$1aA";
        return password;
    }
    private Stream<Character> generatePassword(int count){
        Random random = new SecureRandom();
        IntStream specialChars = random.ints(count, 97, 123);
        return specialChars.mapToObj(data -> (char) data);
    }


}