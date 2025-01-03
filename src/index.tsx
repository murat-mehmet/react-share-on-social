import { ShareOnSocialProps } from "interfaces";
import React, { cloneElement, forwardRef, useImperativeHandle, useMemo, useState } from "react";
import Backdrop from "./components/Backdrop";
import { iconList } from "./config";
import Portal from "./components/Portal";
import Popup from "./components/Popup";
import useDisclosure from "./hooks/use-disclosure";

const ShareOnSocial = forwardRef(
  (
    {
      children,
      backdropColor = "rgba(0,0,0,0.4)",
      closeText = "Close",
      copyToClipboardText = "Copy link",
      copySuccessText = "Copied",
      shareTo = Object.keys(iconList),
      textToShare,
      link,
      linkTitle,
      linkMetaDesc,
      linkFavicon,
      noReferer = false,
      noNativeShare = false,
      onSocialClick = () => null,
    }: ShareOnSocialProps,
    ref
  ) => {
    const { onOpen, onClose, isOpen } = useDisclosure();
    const [backdropFadeClass, setBackdropFadeClass] = useState("socialShareBackdropFadeIn");
    const [popupFadeClass, setPopupFadeClass] = useState("socialSharePopupMoveIn");

    const shareData = useMemo(
      () => ({
        textToShare: textToShare || "",
        link: link || (typeof window !== "undefined" && window.location.href) || "",
        linkTitle: linkTitle || "",
        linkMetaDesc: linkMetaDesc || "",
        linkFavicon: linkFavicon,
      }),
      [textToShare, link, linkTitle, linkMetaDesc, linkFavicon]
    );

    const handleOnClick = async () => {
      if (!noNativeShare && window.navigator.share) {
        try {
          await window.navigator.share({
            url: shareData.link,
            title: shareData.linkTitle,
            text: shareData.textToShare,
          });
          onSocialClick();
        } catch (e) {
          console.warn(e);
        }
      } else {
        setPopupFadeClass("socialSharePopupMoveIn");
        setBackdropFadeClass("socialShareBackdropFadeIn");
        onOpen();
      }
    };

    const handleOnClose = () => {
      setTimeout(onClose, 500);
      setPopupFadeClass("socialSharePopupMoveOut");
      setBackdropFadeClass("socialShareBackdropFadeOut");
    };

    useImperativeHandle(ref, () => ({
      open: handleOnClick,
      close: handleOnClose,
    }));

    return (
      <>
        {cloneElement(children, {
          ...children?.props,
          onClick: handleOnClick,
        })}
        {isOpen && (
          <Portal>
            <Backdrop
              onClose={handleOnClose}
              backdropColor={backdropColor}
              fadeClass={backdropFadeClass}
            >
              <Popup
                onClose={handleOnClose}
                shareTo={shareTo}
                shareData={shareData}
                closeText={closeText}
                copyToClipboardText={copyToClipboardText}
                copySuccessText={copySuccessText}
                onClick={onSocialClick}
                noReferer={noReferer}
                fadeClass={popupFadeClass}
              />
            </Backdrop>
          </Portal>
        )}
      </>
    );
  }
);

export default ShareOnSocial;
