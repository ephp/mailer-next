'use client';

import React, {ReactElement} from 'react';
import {useTranslations} from 'next-intl';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Link from 'next/link';
import {ACCOUNT_SETTINGS} from '@/shared/constants/AppRoutes';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

const METHOD_COLORS: Record<string, 'success' | 'error' | 'info' | 'warning'> = {
  GET: 'info',
  POST: 'success',
  DELETE: 'error',
};

interface CodeBlockProps {
  code: string;
}

const CodeBlock = ({code}: CodeBlockProps): ReactElement => (
  <Box
    component="pre"
    sx={{
      bgcolor: 'grey.900',
      color: 'grey.100',
      p: 2,
      borderRadius: 1,
      overflowX: 'auto',
      fontSize: '0.8rem',
      fontFamily: 'monospace',
      lineHeight: 1.6,
      my: 1,
    }}
  >
    {code.trim()}
  </Box>
);

interface EndpointCardProps {
  method: string;
  path: string;
  title: string;
  desc: string;
  curlExample: string;
  phpExample: string;
}

const EndpointCard = ({method, path, title, desc, curlExample, phpExample}: EndpointCardProps): ReactElement => (
  <Paper variant="outlined" sx={{p: 3, mb: 3}}>
    <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 1}}>
      <Chip label={method} color={METHOD_COLORS[method] ?? 'default'} size="small" sx={{fontWeight: 700, fontFamily: 'monospace'}}/>
      <Typography component="code" sx={{fontFamily: 'monospace', fontSize: '0.875rem', color: 'text.secondary'}}>
        {path}
      </Typography>
    </Box>
    <Typography variant="subtitle1" fontWeight={600} gutterBottom>{title}</Typography>
    <Typography variant="body2" color="text.secondary" gutterBottom>{desc}</Typography>
    <Typography variant="caption" color="text.secondary" sx={{mt: 1, display: 'block'}}>cURL</Typography>
    <CodeBlock code={curlExample}/>
    <Typography variant="caption" color="text.secondary" sx={{mt: 1, display: 'block'}}>PHP</Typography>
    <CodeBlock code={phpExample}/>
  </Paper>
);

const ApiDocsContent = (): ReactElement => {
  const t = useTranslations();

  const BASE = 'https://mailflow.example.com';

  const endpoints: EndpointCardProps[] = [
    {
      method: 'POST',
      path: t('api_docs.endpoints.subscribe.path'),
      title: t('api_docs.endpoints.subscribe.title'),
      desc: t('api_docs.endpoints.subscribe.desc'),
      curlExample: `curl -X POST "${BASE}/api/public/v1/lists/1/contacts" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "mario.rossi@example.com",
    "nome": "Mario",
    "cognome": "Rossi",
    "telefono": "+39 333 1234567",
    "term_ids": [10, 12],
    "privacy_accepted": true
  }'`,
      phpExample: `$response = $client->subscribe(1, [
    'email'            => 'mario.rossi@example.com',
    'nome'             => 'Mario',
    'cognome'          => 'Rossi',
    'telefono'         => '+39 333 1234567',
    'term_ids'         => [10, 12],
    'privacy_accepted' => true,
]);
// $response['contact_id'], $response['email'], $response['iscritto']`,
    },
    {
      method: 'DELETE',
      path: t('api_docs.endpoints.unsubscribe.path'),
      title: t('api_docs.endpoints.unsubscribe.title'),
      desc: t('api_docs.endpoints.unsubscribe.desc'),
      curlExample: `curl -X DELETE "${BASE}/api/public/v1/lists/1/contacts/mario.rossi%40example.com" \\
  -H "X-API-Key: YOUR_API_KEY"`,
      phpExample: `$client->unsubscribe(1, 'mario.rossi@example.com');
// Risposta 204 No Content in caso di successo`,
    },
    {
      method: 'GET',
      path: t('api_docs.endpoints.lookup.path'),
      title: t('api_docs.endpoints.lookup.title'),
      desc: t('api_docs.endpoints.lookup.desc'),
      curlExample: `curl "${BASE}/api/public/v1/lists/1/contacts/mario.rossi%40example.com" \\
  -H "X-API-Key: YOUR_API_KEY"`,
      phpExample: `$contact = $client->lookup(1, 'mario.rossi@example.com');
// $contact['email'], $contact['nome'], $contact['iscritto'], $contact['term_ids']`,
    },
    {
      method: 'GET',
      path: t('api_docs.endpoints.lists.path'),
      title: t('api_docs.endpoints.lists.title'),
      desc: t('api_docs.endpoints.lists.desc'),
      curlExample: `curl "${BASE}/api/public/v1/lists" \\
  -H "X-API-Key: YOUR_API_KEY"`,
      phpExample: `$lists = $client->lists();
// [['id' => 1, 'name' => 'Newsletter', 'description' => '...', 'subscribe_token' => '...']]`,
    },
    {
      method: 'GET',
      path: t('api_docs.endpoints.privacy_policy.path'),
      title: t('api_docs.endpoints.privacy_policy.title'),
      desc: t('api_docs.endpoints.privacy_policy.desc'),
      curlExample: `curl "${BASE}/api/public/v1/lists/1/privacy-policy" \\
  -H "X-API-Key: YOUR_API_KEY"`,
      phpExample: `$result = $client->privacyPolicy(1);
echo $result['privacy_policy'];`,
    },
    {
      method: 'POST',
      path: t('api_docs.endpoints.create_campaign.path'),
      title: t('api_docs.endpoints.create_campaign.title'),
      desc: t('api_docs.endpoints.create_campaign.desc'),
      curlExample: `curl -X POST "${BASE}/api/public/v1/campaigns" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Offerta maggio",
    "emailSubject": "Le nostre promozioni di maggio",
    "body": "<h1>Ciao!</h1><p>Scopri le offerte di questo mese.</p>",
    "mailListIds": [1, 2],
    "taxonomyTermIds": [10]
  }'`,
      phpExample: `$campaign = $client->createCampaign([
    'name'           => 'Offerta maggio',
    'emailSubject'   => 'Le nostre promozioni di maggio',
    'body'           => '<h1>Ciao!</h1><p>Scopri le offerte di questo mese.</p>',
    'mailListIds'    => [1, 2],
    'taxonomyTermIds'=> [10],
]);
// $campaign['campaign_id'], $campaign['status'] === 'draft'`,
    },
    {
      method: 'POST',
      path: t('api_docs.endpoints.send_campaign.path'),
      title: t('api_docs.endpoints.send_campaign.title'),
      desc: t('api_docs.endpoints.send_campaign.desc'),
      curlExample: `curl -X POST "${BASE}/api/public/v1/campaigns/42/send" \\
  -H "X-API-Key: YOUR_API_KEY"`,
      phpExample: `$result = $client->sendCampaign(42);
// $result['status'] === 'sending', $result['recipients'] === 1234`,
    },
    {
      method: 'GET',
      path: t('api_docs.endpoints.campaign_stats.path'),
      title: t('api_docs.endpoints.campaign_stats.title'),
      desc: t('api_docs.endpoints.campaign_stats.desc'),
      curlExample: `curl "${BASE}/api/public/v1/campaigns/42/stats" \\
  -H "X-API-Key: YOUR_API_KEY"`,
      phpExample: `$stats = $client->campaignStats(42);
// $stats['total'], $stats['unique_opens'], $stats['open_rate']
// $stats['unique_clicks'], $stats['click_rate'], $stats['unsubscribes']`,
    },
  ];

  const errorRows: {code: string; desc: string}[] = [
    {code: '401', desc: t('api_docs.errors.401_desc')},
    {code: '403', desc: t('api_docs.errors.403_desc')},
    {code: '404', desc: t('api_docs.errors.404_desc')},
    {code: '409', desc: t('api_docs.errors.409_desc')},
    {code: '422', desc: t('api_docs.errors.422_desc')},
    {code: '429', desc: t('api_docs.errors.429_desc')},
  ];

  return (
    <Box sx={{maxWidth: 800}}>

      {/* Introduzione */}
      <Typography variant="h5" fontWeight={700} gutterBottom>
        {t('api_docs.intro.title')}
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        {t('api_docs.intro.body')}
      </Typography>

      <Divider sx={{my: 3}}/>

      {/* Autenticazione */}
      <Typography variant="h5" fontWeight={700} gutterBottom>
        {t('api_docs.auth.title')}
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        {t('api_docs.auth.body')}
      </Typography>
      <Box sx={{mb: 1}}>
        <Link href={ACCOUNT_SETTINGS} style={{textDecoration: 'none'}}>
          <Button variant="outlined" size="small" endIcon={<OpenInNewIcon fontSize="small"/>}>
            {t('api_docs.auth.account_link')}
          </Button>
        </Link>
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{display: 'block', mt: 2}}>
        {t('api_docs.auth.example_title')}
      </Typography>
      <CodeBlock code="X-API-Key: YOUR_API_KEY"/>

      <Divider sx={{my: 3}}/>

      {/* Rate Limit */}
      <Typography variant="h5" fontWeight={700} gutterBottom>
        {t('api_docs.rate_limit.title')}
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        {t('api_docs.rate_limit.body')}
      </Typography>
      <CodeBlock code={`HTTP/1.1 429 Too Many Requests
Retry-After: 35
Content-Type: application/json

{"error":"rate_limit","message":"API rate limit exceeded"}`}/>

      <Divider sx={{my: 3}}/>

      {/* Endpoints */}
      <Typography variant="h5" fontWeight={700} gutterBottom>
        {t('api_docs.endpoints.title')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{mb: 3}}>
        {t('api_docs.endpoints.base_url_note')}
      </Typography>

      {endpoints.map((ep) => (
        <EndpointCard key={ep.path + ep.method} {...ep}/>
      ))}

      <Divider sx={{my: 3}}/>

      {/* Gestione Errori */}
      <Typography variant="h5" fontWeight={700} gutterBottom>
        {t('api_docs.errors.title')}
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        {t('api_docs.errors.body')}
      </Typography>
      <CodeBlock code={`{
  "error": "not_found",
  "message": "Contact not found"
}`}/>
      <Table size="small" sx={{mb: 3}}>
        <TableBody>
          <TableRow sx={{bgcolor: 'action.hover'}}>
            <TableCell sx={{fontWeight: 700}}>{t('api_docs.errors.table_code')}</TableCell>
            <TableCell sx={{fontWeight: 700}}>{t('api_docs.errors.table_desc')}</TableCell>
          </TableRow>
          {errorRows.map(({code, desc}) => (
            <TableRow key={code}>
              <TableCell>
                <Chip label={code} size="small" variant="outlined" sx={{fontFamily: 'monospace', fontWeight: 600}}/>
              </TableCell>
              <TableCell>{desc}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Divider sx={{my: 3}}/>

      {/* Swagger UI */}
      <Typography variant="h5" fontWeight={700} gutterBottom>
        {t('api_docs.swagger.title')}
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        {t('api_docs.swagger.body')}
      </Typography>
      <Button
        variant="contained"
        size="large"
        endIcon={<OpenInNewIcon/>}
        href="/api/doc"
        target="_blank"
        rel="noopener noreferrer"
        component="a"
      >
        {t('api_docs.swagger.btn')}
      </Button>
    </Box>
  );
};

export default ApiDocsContent;
