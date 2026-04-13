import React, {useState} from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Typography from "@mui/material/Typography";
import {useAuthMethod, useAuthUser} from '@/@oimmei/utility/AuthHooks';
import {AuthUser} from '@/types/models/AuthUser';
import UserForm from '@/components/auth/UserForm';
import {useTranslations} from 'next-intl';

const PersonalInfo = () => {
  const t = useTranslations();

  // Using the original user structure from the server.
  const {rawUser: user} = useAuthUser();
  const {updateProfile, deleteProfile} = useAuthMethod();

  /*** Submit profile ***/
  const handleSubmit = async (data: AuthUser) => {
    await updateProfile({...data});
  };
  /*** END Submit profile ***/

  /*** Delete profile ***/
  const [
    deletingProfile,
    setDeletingProfile,
  ] = useState<boolean>(false);

  const closeDeleteProfileModal = () => {
    setDeletingProfile(false);
  };

  // TODO: uncomment if profile removal is required.
  // const handleDeleteProfileClicked = () => {
  //   setDeletingProfile(true);
  // }
  /*** END Delete profile ***/

  return (
    <Box
      sx={{
        position: "relative",
      }}
    >
      {user && (
        <UserForm
          user={user}
          editing={true}
          onSubmit={handleSubmit}
          // TODO: uncomment if profile removal is required.
          // onDeleteProfileClicked={handleDeleteProfileClicked}
          type={"user"}
        />
      )}

      <Dialog
        open={deletingProfile}
        onClose={closeDeleteProfileModal}
        aria-labelledby="alert-dialog-title"
      >
        <DialogTitle id="alert-dialog-title">
          {t("security.profile.page.delete_profile.title")}
        </DialogTitle>
        <DialogContent>
          <Typography style={{marginBottom: "1rem"}}>
            {t("security.profile.page.delete_profile.description")}
          </Typography>
          <Typography style={{fontWeight: "bold", marginBottom: "1rem"}}>
            {t("security.profile.page.delete_profile.warning")}
          </Typography>
          <Typography>
            {t("security.profile.page.delete_profile.confirm")}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteProfileModal} autoFocus>
            {t("messages.btn.cancel")}
          </Button>
          <Button onClick={deleteProfile}>
            {t("messages.btn.ok")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PersonalInfo;
