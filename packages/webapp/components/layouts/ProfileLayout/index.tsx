import React, {
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  getProfile,
  getProfileSSR,
  PublicProfile,
} from '@dailydotdev/shared/src/lib/user';
import { NextSeoProps } from 'next-seo/lib/types';
import Head from 'next/head';
import { NextSeo } from 'next-seo';
import sizeN from '@dailydotdev/shared/macros/sizeN.macro';
import JoinedDate from '@dailydotdev/shared/src/components/profile/JoinedDate';
import GitHubIcon from '@dailydotdev/shared/icons/github.svg';
import TwitterIcon from '@dailydotdev/shared/icons/twitter.svg';
import HashnodeIcon from '@dailydotdev/shared/icons/hashnode.svg';
import LinkIcon from '@dailydotdev/shared/icons/link.svg';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import { ParsedUrlQuery } from 'querystring';
import { reputationGuide } from '@dailydotdev/shared/src/lib/constants';
import { useQuery } from 'react-query';
import Rank from '@dailydotdev/shared/src/components/Rank';
import request from 'graphql-request';
import { apiUrl } from '@dailydotdev/shared/src/lib/config';
import {
  USER_READING_RANK_QUERY,
  UserReadingRankData,
} from '@dailydotdev/shared/src/graphql/users';
import ProgressiveEnhancementContext from '@dailydotdev/shared/src/contexts/ProgressiveEnhancementContext';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import { QuaternaryButton } from '@dailydotdev/shared/src/components/buttons/QuaternaryButton';
import { LazyImage } from '@dailydotdev/shared/src/components/LazyImage';
import { ResponsivePageContainer } from '@dailydotdev/shared/src/components/utilities';
import { getTooltipProps } from '@dailydotdev/shared/src/lib/tooltip';
import classNames from 'classnames';
import DOMPurify from 'dompurify';
import styles from './index.module.css';
import NavBar, { tabs } from './NavBar';
import { getLayout as getMainLayout } from '../MainLayout';

const AccountDetailsModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "accountDetailsModal" */ '@dailydotdev/shared/src/components/modals/AccountDetailsModal'
    ),
);
const Custom404 = dynamic(() => import('../../../pages/404'));

export interface ProfileLayoutProps {
  profile: PublicProfile;
  children?: ReactNode;
}

const sanitizeOrNull = (
  purify: DOMPurify.DOMPurifyI,
  value: string,
): string | null => (value ? purify.sanitize(value) : null);

export default function ProfileLayout({
  profile: initialProfile,
  children,
}: ProfileLayoutProps): ReactElement {
  const router = useRouter();
  const { isFallback } = router;

  if (!isFallback && !initialProfile) {
    return <Custom404 />;
  }

  const { windowLoaded } = useContext(ProgressiveEnhancementContext);
  const { user } = useContext(AuthContext);
  const selectedTab = tabs.findIndex((tab) => tab.path === router?.pathname);
  const queryKey = ['profile', initialProfile?.id];
  const { data: fetchedProfile } = useQuery<PublicProfile>(
    queryKey,
    () => getProfile(initialProfile.id),
    {
      initialData: initialProfile,
      enabled: !!initialProfile,
    },
  );
  // Needed because sometimes initialProfile is defined and fetchedProfile is not
  const profile = fetchedProfile ?? initialProfile;

  const userRankQueryKey = ['userRank', initialProfile?.id];
  const { data: userRank } = useQuery<UserReadingRankData>(
    userRankQueryKey,
    () =>
      request(`${apiUrl}/graphql`, USER_READING_RANK_QUERY, {
        id: initialProfile?.id,
      }),
    {
      enabled: !!initialProfile,
    },
  );

  const Seo: NextSeoProps = profile
    ? {
        title: profile.name,
        titleTemplate: '%s | daily.dev',
        description: profile.bio
          ? profile.bio
          : `Check out ${profile.name}'s profile`,
        openGraph: {
          images: [{ url: profile.image }],
        },
        twitter: {
          handle: profile.twitter,
        },
      }
    : {};

  const [twitterHandle, setTwitterHandle] = useState<string>();
  const [githubHandle, setGithubHandle] = useState<string>();
  const [hashnodeHandle, setHashnodeHandle] = useState<string>();
  const [portfolioLink, setPortfolioLink] = useState<string>();

  const [showAccountDetails, setShowAccountDetails] = useState(false);

  const closeAccountDetails = () => setShowAccountDetails(false);

  useEffect(() => {
    if (profile) {
      const purify = DOMPurify(window);
      setTwitterHandle(sanitizeOrNull(purify, profile.twitter));
      setGithubHandle(sanitizeOrNull(purify, profile.github));
      setHashnodeHandle(sanitizeOrNull(purify, profile.hashnode));
      setPortfolioLink(sanitizeOrNull(purify, profile.portfolio));
    }
  }, [profile]);

  if (isFallback && !initialProfile) {
    return <></>;
  }

  return (
    <>
      <Head>
        <link rel="preload" as="image" href={profile.image} />
      </Head>
      <NextSeo {...Seo} />
      <ResponsivePageContainer className="px-6">
        <section
          className={classNames(
            'flex flex-col self-start tablet:flex-row tablet:-ml-4 tablet:-mr-4 tablet:self-stretch tablet:overflow-x-hidden',
            styles.header,
          )}
        >
          <div className="flex mb-6 bg-theme-bg-secondary rounded-2xl self-start items-center tablet:flex-col tablet:mb-0 tablet:pt-2 tablet:pb-4 tablet:px-2">
            <LazyImage
              imgSrc={profile.image}
              imgAlt={`${profile.name}'s profile image`}
              eager
              ratio="100%"
              className="rounded-2xl"
              style={{ width: sizeN(25) }}
            />
            <div className="flex flex-col mx-6 typo-footnote tablet:items-center tablet:mt-4 tablet:mx-0">
              <a
                href={reputationGuide}
                target="_blank"
                rel="noopener"
                className="text-theme-label-tertiary no-underline my-0.5"
              >
                Reputation
              </a>
              <span className="my-0.5 text-theme-label-primary font-bold typo-title1">
                {profile.reputation}
              </span>
            </div>
          </div>
          <div className="flex flex-col tablet:flex-1">
            <div className="flex items-center mb-2">
              <h1 className="m-0 text-theme-label-primary font-bold typo-title3">
                {profile.name}
              </h1>
              {userRank?.userReadingRank?.currentRank > 0 && (
                <Rank
                  rank={userRank.userReadingRank.currentRank}
                  colorByRank
                  data-testid="rank"
                  className="w-6 h-6 ml-2"
                />
              )}
            </div>
            {profile.username && (
              <h2 className="m-0 font-normal text-theme-label-secondary typo-callout">
                @{profile.username}
              </h2>
            )}
            {profile.bio && (
              <p className="mt-3 text-theme-label-tertiary break-words typo-callout">
                {profile.bio}
              </p>
            )}
            <JoinedDate
              className="mt-3 text-theme-label-quaternary typo-footnote"
              date={new Date(profile.createdAt)}
            />
            <div className={classNames('flex mt-3 mx-0.5', styles.links)}>
              {twitterHandle && (
                <Button
                  tag="a"
                  href={`https://twitter.com/${twitterHandle}`}
                  {...getTooltipProps('Twitter')}
                  target="_blank"
                  rel="noopener"
                  icon={<TwitterIcon />}
                  className="btn-tertiary"
                />
              )}
              {githubHandle && (
                <Button
                  tag="a"
                  href={`https://github.com/${githubHandle}`}
                  {...getTooltipProps('GitHub')}
                  target="_blank"
                  rel="noopener"
                  icon={<GitHubIcon />}
                  className="btn-tertiary"
                />
              )}
              {hashnodeHandle && (
                <Button
                  tag="a"
                  href={`https://hashnode.com/@${hashnodeHandle}`}
                  {...getTooltipProps('Hashnode')}
                  target="_blank"
                  rel="noopener"
                  icon={<HashnodeIcon />}
                  className="btn-tertiary"
                />
              )}
              {portfolioLink && (
                <QuaternaryButton
                  tag="a"
                  id="portfolio-link"
                  href={portfolioLink}
                  {...getTooltipProps('Portfolio')}
                  target="_blank"
                  rel="noopener"
                  icon={<LinkIcon />}
                  className="btn-tertiary"
                >
                  {portfolioLink
                    .replace(/(^\w+:|^)\/\//, '')
                    .replace(/\/?(\?.*)?$/, '')}
                </QuaternaryButton>
              )}
            </div>
            {profile.id === user?.id && (
              <Button
                className="btn-secondary mt-6 mb-0.5 self-start"
                onClick={() => setShowAccountDetails(true)}
              >
                Account details
              </Button>
            )}
          </div>
        </section>
        <NavBar selectedTab={selectedTab} profile={profile} />
        {children}
      </ResponsivePageContainer>
      {profile.id === user?.id && (windowLoaded || showAccountDetails) && (
        <AccountDetailsModal
          isOpen={showAccountDetails}
          onRequestClose={closeAccountDetails}
        />
      )}
    </>
  );
}

export const getLayout = (
  page: ReactNode,
  props: ProfileLayoutProps,
): ReactNode =>
  getMainLayout(<ProfileLayout {...props}>{page}</ProfileLayout>, null, {
    responsive: false,
  });

interface ProfileParams extends ParsedUrlQuery {
  userId: string;
}

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  return { paths: [], fallback: true };
}

export async function getStaticProps({
  params,
}: GetStaticPropsContext<ProfileParams>): Promise<
  GetStaticPropsResult<Omit<ProfileLayoutProps, 'children'>>
> {
  const { userId } = params;
  try {
    const profile = await getProfileSSR(userId);
    return {
      props: {
        profile,
      },
      revalidate: 60,
    };
  } catch (err) {
    if ('message' in err && err.message === 'not found') {
      return {
        props: { profile: null },
        revalidate: 60,
      };
    }
    throw err;
  }
}
