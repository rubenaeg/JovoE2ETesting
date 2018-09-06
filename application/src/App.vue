<template>
    <div id="app">
        <nav class="navbar navbar-light">
            <a class="navbar-brand"><img src="@/assets/jovo.png"> </a>
            <div class="platform-authorization-container">
                <a :href="(!alexaAuthorized ? 'https://www.amazon.com/ap/oa?client_id=amzn1.application-oa2-client.4362dbb1b7934cbeb97536ead1fec9e1&scope=alexa%3Aall&' +
                    'scope_data=%7B%22alexa%3Aall%22%3A%7B%22productID%22%3A%22jester_webapp%22%2C%22productInstanceAttributes%22%3A%7B%22deviceSerialNumber%22%3A%2212345%22%7D%7D%7D&' +
                    'response_type=code&state=' + id + '&redirect_uri=http%3A%2F%2Flocalhost%3A8008%2Fauthorization%2Falexa'
                    : 'https://www.amazon.com/ap/adam')"
                   class="btn btn-primary alexa-icon-button" @click="alexaLogout">
                    <img src="@/assets/amazon-alexa-logo-D1BE24A213-seeklogo.com.png"/>
                    <label>Alexa</label>
                    <div class="authorization-status">
                        <font-awesome-icon v-if="alexaAuthorized" icon="check-circle"/>
                        <font-awesome-icon v-else icon="circle"/>
                    </div>
                </a>
                <a :href="(!googleAuthorized ? 'https://accounts.google.com/o/oauth2/v2/auth?client_id=148706888226-2mu00q1fc3l6rlv3ltfgbi81qitt7qcm.apps.googleusercontent.com&' +
                    'redirect_uri=http://localhost:8008/authorization/google&scope=https://www.googleapis.com/auth/cloud-platform&access_type=offline&response_type=code&state=' + id
                    : 'https://security.google.com/settings/security/permissions')"
                   class="btn btn-primary google-icon-button" @click="googleLogout">
                    <img src="@/assets/2000px-Google_Assistant_logo.svg.png"/>
                    <label>Google</label>
                    <div class="authorization-status">
                        <font-awesome-icon v-if="googleAuthorized" icon="check-circle"/>
                        <font-awesome-icon v-else icon="circle"/>
                    </div>
                </a>
            </div>
        </nav>
        <router-view/>
    </div>
</template>

<script>
    import 'bootstrap/dist/css/bootstrap.css'
    import 'bootstrap-vue/dist/bootstrap-vue.css'


    export default {
        name: 'App',
        data: function() {
            return {
                id: this.$route.params.id,
                alexaAuthorized: false,
                googleAuthorized: false
            }
        },
        methods: {
            alexaLogout: function() {
                this.alexaAuthorized = false;
            },
            googleLogout: function() {
                this.googleAuthorized = false;
            }
        },
        async mounted() {
            let id = this.$route.params.id;
            let data = JSON.stringify({
                id: id,
            });
            let response = await this.$http.post('http://localhost:8008/authorization', data);
            console.log(response);
            let authorizationState = await this.$http.get('http://localhost:8008/authorization?id=' + this.id);
            this.alexaAuthorized = authorizationState.body.alexaAuthorized;
            this.googleAuthorized = authorizationState.body.googleAuthorized;
        }
    }
</script>

<style lang="scss">
    body {
        width: 100vw;
        height: 100vh;
        background-color: #eaeaea !important;
    }

    #app {
        width: 100%;
        height: 100%;
    }

    v-container {
        width: 100%;
        height: 100%;
    }

    .navbar {
        background-color: #465b8e !important;
        padding-top: 7px;
        padding-bottom: 7px;
        background-image: url(https://www.jovo.tech/img/Header-BG.png), linear-gradient(45deg, #a1e6f2 0%, #5e98e8 58%, #327be2 100%);
        box-shadow: 0 5px 15px 0 rgba(112, 128, 175, 0.2);

    }

    .navbar-brand img {
        max-height: 29px;
    }

    .navbar-brand span {
        color: white;
        font-family: 'Nunito Sans', sans-serif;
        font-size: 15px;
        vertical-align: text-bottom;
        line-height: 16px;
    }

    .platform-authorization-container {
        position: absolute;
        width: 26%;
        max-width: 315px;
        min-width: 305px;
        right: 3%;
        height: 100%;
        top: 0;
        bottom: 0;
        margin: auto;

        .alexa-icon-button, .google-icon-button, .alexa-logout-button, .google-logout-button {
            height: 30px;
            width: 150px;
            position: absolute;
            top: 0;
            bottom: 0;
            margin: auto;
            background-color: white;
            border: none;
            color: black;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            cursor: pointer;
            border-radius: 16px;

            img {
                width: 20px;
                height: 20px;
                left: 7%;
                top: 0;
                bottom: 0;
                position: absolute;
                margin: auto;
            }

            label {
                position: absolute;
                margin: auto;
                top: 0;
                bottom: 0;
                left: 25%;
                height: 82%;
            }

            .fa-check-circle, .fa-circle, .fa-sign-out-alt {
                position: absolute;
                top: 0;
                bottom: 0;
                right: 7%;
                margin: auto;
                color: #3EA001;
            }

            .fa-circle {
                color: black;
            }

            .fa-sign-out-alt {
                color: red;
            }
        }

        .google-icon-button, .google-logout-button {
            right: 0;
        }

        .alexa-icon-button, .alexa-logout-button {
            left: 0;
        }
    }

</style>
