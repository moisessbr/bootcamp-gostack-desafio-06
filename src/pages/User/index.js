import React, { Component } from 'react';
import { ActivityIndicator, View } from 'react-native';
import PropTypes from 'prop-types';
import api from '../../services/api';

import {
  Container,
  Header,
  Avatar,
  Name,
  Bio,
  Stars,
  Touchable,
  Starred,
  OwnerAvatar,
  Info,
  Title,
  Author,
} from './styles';

export default class User extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('user').name,
  });

  static propTypes = {
    navigation: PropTypes.shape({
      getParam: PropTypes.func,
      navigate: PropTypes.func,
    }).isRequired,
  };

  state = {
    stars: [],
    page: 2,
    loading: false,
    refreshing: false,
  };

  async componentDidMount() {
    const { navigation } = this.props;
    const user = navigation.getParam('user');

    const response = await api.get(`/users/${user.login}/starred`);

    this.setState({ stars: response.data });
  }

  handleNavigate = repository => {
    const { navigation } = this.props;

    navigation.navigate('Repository', { repository });
  };

  async loadMore() {
    const { stars, page } = this.state;
    this.setState({ page: page + 1 });
    const { navigation } = this.props;
    const user = navigation.getParam('user');

    const response = await api.get(`/users/${user.login}/starred?page=${page}`);
    this.setState({ stars: [...stars, ...response.data] });
  }

  async refreshList() {
    this.setState({ loading: true });
    const { navigation } = this.props;
    const user = navigation.getParam('user');

    const response = await api.get(`/users/${user.login}/starred`);

    this.setState({ stars: response.data, loading: false });
  }

  render() {
    const { navigation } = this.props;
    const { stars, loading, refreshing } = this.state;
    const user = navigation.getParam('user');

    return (
      <Container>
        <Header>
          <Avatar source={{ uri: user.avatar }} />
          <Name>{user.name}</Name>
          <Bio>{user.bio}</Bio>
        </Header>
        <View loading={loading}>
          {loading ? (
            <ActivityIndicator />
          ) : (
            <Stars
              onRefresh={() => this.refreshList()}
              refreshing={refreshing}
              onEndReachedThreshold={0.2}
              onEndReached={() => this.loadMore()}
              data={stars}
              keyExtractor={star => String(star.id)}
              renderItem={({ item }) => (
                <Touchable onPress={() => this.handleNavigate(item)}>
                  <Starred>
                    <OwnerAvatar source={{ uri: item.owner.avatar_url }} />
                    <Info>
                      <Title>{item.name}</Title>
                      <Author>{item.owner.login}</Author>
                    </Info>
                  </Starred>
                </Touchable>
              )}
            />
          )}
        </View>
      </Container>
    );
  }
}
