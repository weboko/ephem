type Invitation = {
  id: string;
};

const EPHEMERAL_STORAGE_KEY = 'app_invites';
const STORAGE_KEY = 'app_accepted';

class Contacts {
  public createInvite(): Invitation {
    const invite: Invitation = {
      id: crypto.randomUUID()
    };

    return invite;
  }
}

export default new Contacts();