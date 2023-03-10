import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useIntl } from 'react-intl';
import { Portal, FocusTrap, IconButton, Box, Flex, Typography } from '@strapi/design-system';
import { LinkButton } from '@strapi/design-system/v2';
import { ExternalLink, Cross } from '@strapi/icons';
import { setHexOpacity, useLockScroll } from '@strapi/helper-plugin';
import AirBalloon from '../../assets/images/hot-air-balloon.png';
import BigArrow from '../../assets/images/upgrade-details.png';

const UpgradeWrapper = styled.div`
  position: absolute;
  z-index: 3;
  inset: 0;
  background: ${({ theme }) => setHexOpacity(theme.colors.neutral800, 0.2)};
  padding: 0 ${({ theme }) => theme.spaces[8]};
`;

const UpgradeContainer = styled(Flex)`
  position: relative;
  max-width: ${830 / 16}rem;
  height: ${415 / 16}rem;
  margin: 0 auto;
  overflow: hidden;
  margin-top: 10%;
  padding-left: ${64 / 16}rem;

  img:first-of-type {
    position: absolute;
    right: 0;
    top: 0;
    max-width: ${360 / 16}rem;
  }

  img:not(:first-of-type) {
    width: ${130 / 16}rem;
    margin-left: 12%;
    margin-right: ${20 / 16}rem;
    z-index: 0;
  }
`;

const FlexStart = styled(Flex)`
  max-width: ${400 / 16}rem;
  z-index: 0;
`;

const CloseButtonContainer = styled(Box)`
  position: absolute;
  right: ${({ theme }) => theme.spaces[4]};
  top: ${({ theme }) => theme.spaces[4]};
`;

const UpgradePlanModal = ({ onClose, isOpen }) => {
  useLockScroll(isOpen);
  const { formatMessage } = useIntl();

  if (!isOpen) {
    return null;
  }

  return (
    <Portal>
      <UpgradeWrapper onClick={onClose}>
        <FocusTrap onEscape={onClose}>
          <UpgradeContainer
            onClick={(e) => e.stopPropagation()}
            aria-labelledby="upgrade-plan"
            background="neutral0"
            hasRadius
          >
            <img src={AirBalloon} alt="air-balloon" />
            <CloseButtonContainer>
              <IconButton onClick={onClose} aria-label="Close" icon={<Cross />} />
            </CloseButtonContainer>
            <FlexStart direction="column" alignItems="flex-start" gap={6}>
              <Typography fontWeight="bold" textColor="primary600">
                {formatMessage({
                  id: 'app.components.UpgradePlanModal.text-ce',
                  defaultMessage: 'COMMUNITY EDITION',
                })}
              </Typography>
              <Flex direction="column" alignItems="stretch" gap={2}>
                <Typography variant="alpha" as="h2" id="upgrade-plan">
                  {formatMessage({
                    id: 'app.components.UpgradePlanModal.limit-reached',
                    defaultMessage: 'You have reached the limit',
                  })}
                </Typography>
                <Typography>
                  {formatMessage({
                    id: 'app.components.UpgradePlanModal.text-power',
                    defaultMessage:
                      'Unlock the full power of Strapi by upgrading your plan to the Enterprise Edition',
                  })}
                </Typography>
              </Flex>
              <LinkButton
                href="https://strapi.io/pricing-self-hosted"
                isExternal
                endIcon={<ExternalLink />}
              >
                {formatMessage({
                  id: 'app.components.UpgradePlanModal.button',
                  defaultMessage: 'Learn more',
                })}
              </LinkButton>
            </FlexStart>
            <img src={BigArrow} alt="upgrade-arrow" />
          </UpgradeContainer>
        </FocusTrap>
      </UpgradeWrapper>
    </Portal>
  );
};

UpgradePlanModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
};

export default UpgradePlanModal;
