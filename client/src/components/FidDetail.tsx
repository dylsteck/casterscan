import { useNeynarUser } from '@/hooks/useNeynarUser';
import { useSigners } from '@/hooks/useSigners';
import { CopyButton } from './CopyButton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';

interface FidDetailProps {
  fid: string;
}

export function FidDetail({ fid }: FidDetailProps) {
  const { data: user, isLoading, error } = useNeynarUser(fid);
  const { data: signersData, isLoading: signersLoading, error: signersError } = useSigners(fid);

  if (isLoading) {
    return (
      <div className="w-screen h-screen flex justify-center items-start">
        <div className="w-[90%] md:w-[80%] lg:w-[70%] xl:w-[60%] flex flex-col gap-2">
          <div className="animate-pulse mt-3">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-32 bg-gray-200 rounded mb-4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="w-screen h-screen flex justify-center items-start">
        <div className="w-[90%] md:w-[80%] lg:w-[70%] xl:w-[60%] flex flex-col gap-2">
          <p className="text-xl font-semibold mt-3">profile details</p>
          <div className="p-2 border border-black">
            <p className="text-red-600">Failed to load user data for FID: {fid}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex justify-center items-start">
      <div className="w-[90%] md:w-[80%] lg:w-[70%] xl:w-[60%] flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center gap-4 mt-6 mb-4">
          <img src={user.pfp_url} alt={`${user.username}'s PFP`} className="w-16 h-16 rounded-full" />
          <div>
            <h1 className="text-2xl font-bold">{user.display_name}</h1>
            <p className="text-gray-600">@{user.username}</p>
            <p className="text-sm text-gray-500">{user.profile?.bio?.text}</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-200 border border-gray-300 p-1 rounded-lg h-12">
            <TabsTrigger value="overview" className="px-4 py-2 text-sm font-medium text-gray-700 bg-transparent border-0 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm rounded-md transition-all">Overview</TabsTrigger>
            <TabsTrigger value="addresses" className="px-4 py-2 text-sm font-medium text-gray-700 bg-transparent border-0 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm rounded-md transition-all">Addresses</TabsTrigger>
            <TabsTrigger value="signers" className="px-4 py-2 text-sm font-medium text-gray-700 bg-transparent border-0 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm rounded-md transition-all">Signers</TabsTrigger>
            <TabsTrigger value="raw" className="px-4 py-2 text-sm font-medium text-gray-700 bg-transparent border-0 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm rounded-md transition-all">Raw Data</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-4">
            <div className="p-2 border border-black relative" style={{ wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-all' }}>
              <ul className="list-none">
                <li className="flex justify-between items-center mb-1">
                  <span className="font-semibold mr-1">username</span>
                  <span className="flex items-center text-right">
                    {user.username}
                    <CopyButton value={user.username} className="ml-1 flex-shrink-0" />
                  </span>
                </li>
                <li className="flex justify-between items-center mb-1">
                  <span className="font-semibold mr-1">fid</span>
                  <span className="flex items-center text-right">
                    {user.fid}
                    <CopyButton value={user.fid.toString()} className="ml-1 flex-shrink-0" />
                  </span>
                </li>
                <li className="flex justify-between items-center mb-1">
                  <span className="font-semibold mr-1">custody address</span>
                  <span className="flex items-center text-right">
                    {user.custody_address}
                    <CopyButton value={user.custody_address} className="ml-1 flex-shrink-0" />
                  </span>
                </li>
                <li className="flex justify-between items-center mb-1">
                  <span className="font-semibold mr-1">follower count</span>
                  <span className="flex items-center text-right">
                    {user.follower_count.toLocaleString()}
                    <CopyButton value={user.follower_count.toString()} className="ml-1 flex-shrink-0" />
                  </span>
                </li>
                <li className="flex justify-between items-center mb-1">
                  <span className="font-semibold mr-1">following count</span>
                  <span className="flex items-center text-right">
                    {user.following_count.toLocaleString()}
                    <CopyButton value={user.following_count.toString()} className="ml-1 flex-shrink-0" />
                  </span>
                </li>
                <li className="flex justify-between items-center mb-1">
                  <span className="font-semibold mr-1">power badge</span>
                  <span className="flex items-center text-right">
                    {user.power_badge ? 'Yes' : 'No'}
                    <CopyButton value={user.power_badge.toString()} className="ml-1 flex-shrink-0" />
                  </span>
                </li>

                {user.verified_accounts && user.verified_accounts.length > 0 && (
                  <li className="flex justify-between items-start mb-1">
                    <span className="font-semibold mr-1">verified accounts</span>
                    <div className="flex flex-col items-end">
                      {user.verified_accounts.map((account, index) => (
                        <div key={index} className="flex items-center text-right mb-1">
                          <span className="text-sm">{account.platform}: {account.username}</span>
                          <CopyButton value={`${account.platform}: ${account.username}`} className="ml-1 flex-shrink-0" />
                        </div>
                      ))}
                    </div>
                  </li>
                )}
              </ul>
            </div>
          </TabsContent>
          
          <TabsContent value="addresses" className="mt-4">
            <div className="p-2 border border-black">
              {((user.auth_addresses && user.auth_addresses.length > 0) || (user.verified_addresses && user.verified_addresses.eth_addresses.length > 0) || (user.verified_addresses && user.verified_addresses.sol_addresses.length > 0)) ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-300">
                        <th className="text-left py-1 font-semibold">address</th>
                        <th className="text-left py-1 font-semibold">type</th>
                        <th className="text-left py-1 font-semibold">state</th>
                        <th className="text-left py-1 font-semibold">fid</th>
                        <th className="w-8"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {user.verified_addresses?.eth_addresses?.map((address, index) => (
                        <tr key={`verified-eth-${index}`} className="border-b border-gray-100">
                          <td className="py-1 font-mono text-sm break-all">{address}</td>
                          <td className="py-1">
                            <span className="text-blue-600 font-medium">Verified</span>
                          </td>
                          <td className="py-1">Active</td>
                          <td className="py-1">-</td>
                          <td className="py-1">
                            <CopyButton value={address} className="flex-shrink-0" />
                          </td>
                        </tr>
                      ))}
                      {user.verified_addresses?.sol_addresses?.map((address, index) => (
                        <tr key={`verified-sol-${index}`} className="border-b border-gray-100">
                          <td className="py-1 font-mono text-sm break-all">{address}</td>
                          <td className="py-1">
                            <span className="text-blue-600 font-medium">Verified</span>
                          </td>
                          <td className="py-1">Active</td>
                          <td className="py-1">-</td>
                          <td className="py-1">
                            <CopyButton value={address} className="flex-shrink-0" />
                          </td>
                        </tr>
                      ))}
                      {user.auth_addresses?.map((authAddr, index) => (
                        <tr key={`auth-${index}`} className="border-b border-gray-100">
                          <td className="py-1 font-mono text-sm break-all">{authAddr.address}</td>
                          <td className="py-1">
                            <span className="text-green-600 font-medium">Auth</span>
                          </td>
                          <td className="py-1">Active</td>
                          <td className="py-1 font-mono">{authAddr.app.fid}</td>
                          <td className="py-1">
                            <CopyButton value={authAddr.address} className="flex-shrink-0" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No addresses found.</p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="signers" className="mt-4">
            <div className="p-2 border border-black">
              {signersLoading ? (
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                </div>
              ) : signersError ? (
                <p className="text-red-600">Failed to load signers data</p>
              ) : signersData && signersData.events.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-300">
                        <th className="text-left py-1 font-semibold">key</th>
                        <th className="text-left py-1 font-semibold">type</th>
                        <th className="text-left py-1 font-semibold">event</th>
                        <th className="text-left py-1 font-semibold">block</th>
                        <th className="text-left py-1 font-semibold">tx hash</th>
                        <th className="w-8"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {signersData.events.map((signer, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-1 font-mono text-xs break-all max-w-[200px]">
                            {signer.signerEventBody.key}
                          </td>
                          <td className="py-1">
                            <span className={`font-medium ${signer.signerEventBody.keyType === 1 ? 'text-blue-600' : 'text-gray-600'}`}>
                              {signer.signerEventBody.keyType === 1 ? 'Ed25519' : `Type ${signer.signerEventBody.keyType}`}
                            </span>
                          </td>
                          <td className="py-1">
                            <span className={`font-medium ${signer.signerEventBody.eventType === 'SIGNER_EVENT_TYPE_ADD' ? 'text-green-600' : 'text-red-600'}`}>
                              {signer.signerEventBody.eventType === 'SIGNER_EVENT_TYPE_ADD' ? 'ADD' : 'REMOVE'}
                            </span>
                          </td>
                          <td className="py-1 font-mono text-sm">
                            {signer.blockNumber.toLocaleString()}
                          </td>
                          <td className="py-1 font-mono text-xs break-all max-w-[150px]">
                            {signer.transactionHash}
                          </td>
                          <td className="py-1">
                            <CopyButton value={signer.signerEventBody.key} className="flex-shrink-0" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No signers found for this FID.</p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="raw" className="mt-4">
            <div className="p-2 border border-black">
              <pre className="text-xs overflow-auto max-h-96 bg-gray-50 p-2 rounded">
                <code>{JSON.stringify(user, null, 2)}</code>
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
